import { 
  HumanMessage, 
  SystemMessage, 
  AIMessage,
  ToolMessage 
} from '@langchain/core/messages';
import { 
  createOpenAIFunctionsAgent,
  AgentExecutor 
} from 'langchain/agents';
import { 
  createConversationalAgent,
  createReactAgent 
} from 'langchain/agents';
import { 
  ChatOpenAI,
  OpenAIEmbeddings 
} from '@langchain/openai';
import { 
  TavilySearch 
} from '@langchain/community/tools/tavily_search';
import { 
  DynamicTool 
} from 'langchain/tools';
import { traceable } from 'langsmith/traceable';
import axios from 'axios';

if (process.env.LANGSMITH_API_KEY) {
  process.env.LANGSMITH_TRACING_V2 = 'true';
}

const FORAGE_URL = process.env.FORAGE_URL || 'https://ernesta-labs--forage.apify.actor';
const FORAGE_TOKEN = process.env.FORAGE_TOKEN;
const GRAPH_API_URL = process.env.GRAPH_API_URL || 'https://forage-graph-production.up.railway.app';
const GRAPH_API_SECRET = process.env.GRAPH_API_SECRET || '6da69224eb14e6bdb0fb63514b772480d23a4467f8ac8a4b15266a8262d7f959';

const llm = new ChatOpenAI({
  model: 'gpt-4.1',
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

// Traceable wrappers for LangSmith
const traceCompanyInfo = traceable(
  async (company: string, domain?: string) => {
    const agentUrl = process.env.AGENT_URL || 'http://localhost:3000/api/agent';
    const res = await fetch(agentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `Get company info for ${domain || company}` }]
      })
    });
    const data = await res.json();
    return data.result;
  },
  { name: 'get_company_info', metadata: { tool: 'forage', action: 'company_intel' } }
);

const traceSearchNews = traceable(
  async (company: string) => {
    const agentUrl = process.env.AGENT_URL || 'http://localhost:3000/api/agent';
    const res = await fetch(agentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `Search web for ${company} funding news 2024 2025` }]
      })
    });
    const data = await res.json();
    return data.result;
  },
  { name: 'search_news', metadata: { tool: 'forage', action: 'news' } }
);

const traceFindEmails = traceable(
  async (company: string, domain?: string) => {
    const agentUrl = process.env.AGENT_URL || 'http://localhost:3000/api/agent';
    const res = await fetch(agentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `Find emails for ${domain || company}` }]
      })
    });
    const data = await res.json();
    return data.result;
  },
  { name: 'find_emails', metadata: { tool: 'forage', action: 'lead_generation' } }
);

const traceGenerateSummary = traceable(
  async (company: string, data: any) => {
    const prompt = `Based on this research data for ${company}, generate a concise B2B sales report:

Company: ${JSON.stringify(data.companyInfo?.slice(0, 500) || 'N/A')}
News: ${JSON.stringify(data.news?.slice(0, 500) || 'N/A')}
Emails: ${JSON.stringify(data.emails?.slice(0, 500) || 'N/A')}

Provide:
1. Priority Score (1-10)
2. Key Signals
3. Best Contacts  
4. Pitch`;

    const response = await llm.invoke(prompt);
    return response.content;
  },
  { name: 'generate_summary', metadata: { model: 'gpt-4.1' } }
);

const traceAddClaim = traceable(
  async (company: string, claim: string) => {
    const res = await axios.post(`${GRAPH_API_URL}/claim`, {
      entity: company,
      relation: 'researched_by',
      target: 'forage-sales-agent',
      assertion: claim,
      source_url: 'https://forage.ai/sales-agent',
      confidence: 0.9
    }, {
      headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` }
    });
    return res.data;
  },
  { name: 'add_claim', metadata: { graph: 'knowledge' } }
);

const traceAddSignal = traceable(
  async (company: string, value: number) => {
    const res = await axios.post(`${GRAPH_API_URL}/signal`, {
      entity: company,
      metric: 'sales_interest_score',
      value,
      timestamp: Date.now()
    }, {
      headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` }
    });
    return res.data;
  },
  { name: 'add_signal', metadata: { graph: 'knowledge' } }
);

const traceFullResearch = traceable(
  async (company: string, domain?: string) => {
    const results: any = { company, domain: domain || company.toLowerCase().replace(/\s+/g, '') + '.com', actions: [] };
    
    // Step 1: Get company info
    results.actions.push('Fetching company info...');
    results.companyInfo = await traceCompanyInfo(company, domain);
    results.actions.push('✓ Got company info');
    
    // Step 2: Search news
    results.actions.push('Searching news...');
    results.news = await traceSearchNews(company);
    results.actions.push('✓ Got news');
    
    // Step 3: Find emails
    results.actions.push('Finding emails...');
    results.emails = await traceFindEmails(company, domain);
    results.actions.push('✓ Got emails');
    
    // Step 4: Generate summary
    results.summary = await traceGenerateSummary(company, results);
    results.actions.push('✓ Generated summary');
    
    // Step 5: Add to knowledge graph
    results.actions.push('Adding to knowledge graph...');
    try {
      await traceAddClaim(company, `Researched: Priority based on available data.`);
      results.actions.push('✓ Added claim');
    } catch (e: any) {
      results.graphError = e.message;
    }
    
    try {
      await traceAddSignal(company, results.emails?.includes('@') ? 8 : 5);
      results.actions.push('✓ Added signal');
    } catch (e: any) {
      results.signalError = e.message;
    }
    
    return results;
  },
  { name: 'full_research', metadata: { agent: 'sales', version: '1.0' } }
);

async function callForageTool(toolName: string, args: Record<string, any>) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
    'Authorization': `Token ${FORAGE_TOKEN}`
  };

  const initResponse = await fetch(`${FORAGE_URL}/?token=${FORAGE_TOKEN}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'langchain-sales-agent', version: '1.0' }
      }
    })
  });

  const initText = await initResponse.text();
  const sessionMatch = initText.match(/mcp-session-id:\s*(\S+)/);
  const sessionId = sessionMatch ? sessionMatch[1] : '';

  if (sessionId) {
    headers['mcp-session-id'] = sessionId;
  }

  const toolResponse = await fetch(`${FORAGE_URL}/?token=${FORAGE_TOKEN}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: { name: toolName, arguments: args }
    })
  });

  const text = await toolResponse.text();
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('{')) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.result?.content) {
          return parsed.result.content[0]?.text || JSON.stringify(parsed.result);
        }
      } catch {}
    }
  }
  
  return text.slice(0, 2000);
}

const toolImplementations: Record<string, any> = {
  search_web: async (args: any) => {
    return callForageTool('search_web', args);
  },
  scrape_page: async (args: any) => {
    return callForageTool('scrape_page', args);
  },
  get_company_info: async (args: any) => {
    return callForageTool('get_company_info', args);
  },
  find_emails: async (args: any) => {
    return callForageTool('find_emails', args);
  },
  find_leads: async (args: any) => {
    return callForageTool('find_leads', args);
  },
  query_knowledge: async (args: any) => {
    return callForageTool('query_knowledge', args);
  },
  enrich_entity: async (args: any) => {
    return callForageTool('enrich_entity', args);
  },
  get_claims: async (args: any) => {
    const res = await axios.get(`${GRAPH_API_URL}/claims/${encodeURIComponent(args.entity)}`, {
      headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` }
    });
    return JSON.stringify(res.data, null, 2);
  },
  add_claim: async (args: any) => {
    const res = await axios.post(`${GRAPH_API_URL}/claim`, args, {
      headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` }
    });
    return JSON.stringify(res.data, null, 2);
  },
  get_regime: async (args: any) => {
    const res = await axios.get(`${GRAPH_API_URL}/regime/${encodeURIComponent(args.entity)}`, {
      headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` }
    });
    return JSON.stringify(res.data, null, 2);
  },
  set_regime: async (args: any) => {
    const res = await axios.post(`${GRAPH_API_URL}/regime`, args, {
      headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` }
    });
    return JSON.stringify(res.data, null, 2);
  },
  get_signals: async (args: any) => {
    const res = await axios.get(`${GRAPH_API_URL}/signals/${encodeURIComponent(args.entity)}`, {
      headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` },
      params: { metric: args.metric, limit: args.limit || 100 }
    });
    return JSON.stringify(res.data, null, 2);
  },
  add_signal: async (args: any) => {
    const res = await axios.post(`${GRAPH_API_URL}/signal`, {
      ...args,
      timestamp: args.timestamp || Date.now()
    }, {
      headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` }
    });
    return JSON.stringify(res.data, null, 2);
  },
  get_causal_parents: async (args: any) => {
    const res = await axios.post(`${GRAPH_API_URL}/causal_parents`, {
      entity: args.entity,
      limit: args.limit || 10
    }, {
      headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` }
    });
    return JSON.stringify(res.data, null, 2);
  },
  get_causal_children: async (args: any) => {
    const res = await axios.post(`${GRAPH_API_URL}/causal_children`, {
      entity: args.entity,
      limit: args.limit || 10
    }, {
      headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` }
    });
    return JSON.stringify(res.data, null, 2);
  },
  get_causal_path: async (args: any) => {
    const res = await axios.post(`${GRAPH_API_URL}/causal_path`, {
      from: args.from_entity,
      to: args.to_entity
    }, {
      headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` }
    });
    return JSON.stringify(res.data, null, 2);
  },
  simulate: async (args: any) => {
    const res = await axios.post(`${GRAPH_API_URL}/simulate`, {
      entity: args.entity,
      intervention: args.intervention,
      depth: args.depth || 3
    }, {
      headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` }
    });
    return JSON.stringify(res.data, null, 2);
  },
  skill_company_dossier: async (args: any) => {
    return callForageTool('skill_company_dossier', args);
  },
  skill_prospect_company: async (args: any) => {
    return callForageTool('skill_prospect_company', args);
  },
  skill_funding_intel: async (args: any) => {
    return callForageTool('skill_funding_intel', args);
  },
  skill_job_signals: async (args: any) => {
    return callForageTool('skill_job_signals', args);
  },
  skill_tech_stack: async (args: any) => {
    return callForageTool('skill_tech_stack', args);
  },
  skill_competitor_intel: async (args: any) => {
    return callForageTool('skill_competitor_intel', args);
  }
};

const tools = [
  new DynamicTool({
    name: 'search_web',
    description: 'Real-time web search for current information, news, or general queries.',
    func: async (query: string) => JSON.stringify(await toolImplementations.search_web({ query, num_results: 5 }))
  }),
  new DynamicTool({
    name: 'get_company_info',
    description: 'Get website summary and email contacts for a company domain.',
    func: async (domain: string) => JSON.stringify(await toolImplementations.get_company_info({ domain, find_emails: true }))
  }),
  new DynamicTool({
    name: 'enrich_entity',
    description: 'Retrieve all accumulated data about a company from the knowledge graph.',
    func: async (identifier: string) => JSON.stringify(await toolImplementations.enrich_entity({ identifier }))
  }),
  new DynamicTool({
    name: 'get_claims',
    description: 'Retrieve all claims/provenance assertions for an entity.',
    func: async (entity: string) => JSON.stringify(await toolImplementations.get_claims({ entity }))
  }),
  new DynamicTool({
    name: 'get_regime',
    description: 'Get the current regime label for an entity (normal, stressed, pre_tipping, post_event).',
    func: async (entity: string) => JSON.stringify(await toolImplementations.get_regime({ entity }))
  }),
  new DynamicTool({
    name: 'set_regime',
    description: 'Set the regime label for an entity.',
    func: async (args: string) => {
      const { entity, regime } = JSON.parse(args);
      return JSON.stringify(await toolImplementations.set_regime({ entity, regime }));
    }
  }),
  new DynamicTool({
    name: 'get_causal_parents',
    description: 'Find entities that drive/caused this entity upstream.',
    func: async (entity: string) => JSON.stringify(await toolImplementations.get_causal_parents({ entity, limit: 10 }))
  }),
  new DynamicTool({
    name: 'get_causal_children',
    description: 'Find entities this entity drives downstream.',
    func: async (entity: string) => JSON.stringify(await toolImplementations.get_causal_children({ entity, limit: 10 }))
  }),
  new DynamicTool({
    name: 'simulate',
    description: 'Simulate a shock/boost/remove intervention on an entity.',
    func: async (args: string) => {
      const { entity, intervention, depth } = JSON.parse(args);
      return JSON.stringify(await toolImplementations.simulate({ entity, intervention, depth: depth || 3 }));
    }
  }),
  new DynamicTool({
    name: 'skill_company_dossier',
    description: 'Comprehensive company research with website summary, emails, and key contacts.',
    func: async (domain: string) => JSON.stringify(await toolImplementations.skill_company_dossier({ domain }))
  }),
  new DynamicTool({
    name: 'skill_prospect_company',
    description: 'Find decision makers at a company with verified emails.',
    func: async (domain: string) => JSON.stringify(await toolImplementations.skill_prospect_company({ domain }))
  }),
  new DynamicTool({
    name: 'skill_funding_intel',
    description: 'Get funding history, investors, and recent news for a company.',
    func: async (args: string) => {
      const { company_name, domain } = JSON.parse(args);
      return JSON.stringify(await toolImplementations.skill_funding_intel({ company_name, domain }));
    }
  }),
  new DynamicTool({
    name: 'skill_job_signals',
    description: 'Analyze job listings to reveal hiring strategy and growth areas.',
    func: async (args: string) => {
      const { company_name, domain } = JSON.parse(args);
      return JSON.stringify(await toolImplementations.skill_job_signals({ company_name, domain }));
    }
  }),
  new DynamicTool({
    name: 'skill_tech_stack',
    description: 'Detect technologies and platforms a company uses.',
    func: async (domain: string) => JSON.stringify(await toolImplementations.skill_tech_stack({ domain }))
  })
];

const SALES_AGENT_SYSTEM_PROMPT = `You are an elite B2B sales development agent powered by causal intelligence.

Your mission is to identify high-value prospects, understand their pain points and opportunities, and generate personalized outreach that books meetings.

## Your Capabilities

You have access to:
1. **Web Search** - Find current news, events, and information about companies
2. **Company Intelligence** - Get comprehensive profiles including funding, tech stack, hiring signals
3. **Knowledge Graph** - Access accumulated intelligence about companies and their connections
4. **Causal Analysis** - Understand what drives companies and what they impact
5. **Decision Maker Finding** - Identify and get contact info for key stakeholders

## Research Framework

For each prospect company, follow this framework:

### 1. IDENTIFY SIGNALS (Use tools in parallel when possible)
- Search for recent news (funding, expansions, leadership changes)
- Get funding intelligence (funding rounds, investors, valuation trends)
- Analyze job signals (hiring surges, layoffs, department focus)
- Check tech stack (what tools they use, reveals priorities)

### 2. ASSESS PAIN/OPPORTUNITY
- Look for "port delays" = supply chain pain = your solution opportunity
- Look for "hiring freeze" = cost cutting = your solution opportunity  
- Look for " Series C" = growth mode = expand budget
- Look for "layoffs" = stressed = quick wins possible
- Use get_regime to check if company is stressed/pre_tipping

### 3. FIND DECISION MAKERS
- Use skill_prospect_company to find verified emails
- Target: VP of, Director of, C-suite
- Match contact to the pain you're solving

### 4. BUILD CAUSAL NARRATIVE
- Use get_causal_parents to understand what drives the company
- Use get_causal_path to find connections to your solution
- Craft story: "We help [COMPANY] because [CAUSAL_LINK]"

### 5. SCORE & PRIORITIZE
- High pain + high growth = HOT prospect
- Stressed regime + your solution = quick win
- Add claims to knowledge graph for evidence-backed outreach

## Output FORMAT

After research, always provide:
1. Company name and domain
2. Key signals (funding, hires, news)
3. Assessed pain points or opportunities
4. Recommended decision makers to target
5. Personalized pitch angle
6. Priority score (1-10)

Always use tools to gather real data. Never make up facts.`;

export async function runSalesResearch(company: string, domain?: string): Promise<string> {
  try {
    const results = await traceFullResearch(company, domain);
    return JSON.stringify({
      company: results.company,
      domain: results.domain,
      actions_taken: results.actions,
      company_info: results.companyInfo?.slice(0, 1000),
      news: results.news?.slice(0, 1000),
      emails: results.emails?.slice(0, 1000),
      summary: results.summary,
      knowledge_graph: {
        claim_added: !results.graphError,
        signal_added: !results.signalError
      }
    }, null, 2);
  } catch (error: any) {
    return JSON.stringify({ error: error.message }, null, 2);
  }
}

export async function runTerritoryScan(keyword: string, location: string): Promise<string> {
  const prompt = `${SALES_AGENT_SYSTEM_PROMPT}

Find B2B leads for "${keyword}" in "${location}".
1. Use find_leads to get companies
2. For top 5 companies, get company intelligence in parallel
3. Identify highest priority prospects
4. Return ranked list with scores`;

  try {
    const response = await llm.invoke(prompt);
    return response.content as string;
  } catch (error: any) {
    return `Error: ${error.message}`;
  }
}

export async function runCompetitiveIntel(competitor: string): Promise<string> {
  const prompt = `${SALES_AGENT_SYSTEM_PROMPT}

Research competitive landscape for "${competitor}".
1. Get competitor's tech stack
2. Find their customers (use search_web)
3. Identify gaps/weaknesses
4. Find companies using competitor that could switch
5. Provide switch pitch angles`;

  try {
    const response = await llm.invoke(prompt);
    return response.content as string;
  } catch (error: any) {
    return `Error: ${error.message}`;
  }
}
