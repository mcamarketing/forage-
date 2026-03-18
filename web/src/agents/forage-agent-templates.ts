import { ChatOpenAI } from '@langchain/openai';
import { DynamicTool } from 'langchain/tools';
import { traceable } from 'langsmith/traceable';
import axios from 'axios';

const FORAGE_TOKEN = process.env.FORAGE_TOKEN;
const FORAGE_URL = process.env.FORAGE_URL || 'https://ernesta-labs--forage.apify.actor';
const GRAPH_API_URL = process.env.GRAPH_API_URL || 'https://forage-graph-production.up.railway.app';
const GRAPH_API_SECRET = process.env.GRAPH_API_SECRET;

const llm = new ChatOpenAI({
  model: 'deepseek-chat',
  temperature: 0.7,
  apiKey: process.env.DEEPSEEK_API_KEY,
  configuration: { baseURL: 'https://api.deepseek.com/v1' },
});

const TRACEABLE_FUNCTIONS = {
  searchWeb: traceable(async (query: string) => {
    const res = await axios.post(`${process.env.AGENT_URL || 'http://localhost:3000/api/agent'}`, {
      messages: [{ role: 'user', content: `Search: ${query}` }]
    });
    return res.data.result;
  }, { name: 'search_web', metadata: { tool: 'forage' } }),

  getCompanyInfo: traceable(async (domain: string) => {
    const res = await axios.post(`${process.env.AGENT_URL || 'http://localhost:3000/api/agent'}`, {
      messages: [{ role: 'user', content: `Get company info for ${domain}` }]
    });
    return res.data.result;
  }, { name: 'get_company_info', metadata: { tool: 'forage' } }),

  findEmails: traceable(async (domain: string) => {
    const res = await axios.post(`${process.env.AGENT_URL || 'http://localhost:3000/api/agent'}`, {
      messages: [{ role: 'user', content: `Find emails for ${domain}` }]
    });
    return res.data.result;
  }, { name: 'find_emails', metadata: { tool: 'forage' } }),

  fundingIntel: traceable(async (company: string) => {
    const res = await axios.post(`${process.env.AGENT_URL || 'http://localhost:3000/api/agent'}`, {
      messages: [{ role: 'user', content: `Get funding intel for ${company}` }]
    });
    return res.data.result;
  }, { name: 'skill_funding_intel', metadata: { tool: 'forage' } }),

  jobSignals: traceable(async (company: string) => {
    const res = await axios.post(`${process.env.AGENT_URL || 'http://localhost:3000/api/agent'}`, {
      messages: [{ role: 'user', content: `Get job signals for ${company}` }]
    });
    return res.data.result;
  }, { name: 'skill_job_signals', metadata: { tool: 'forage' } }),

  techStack: traceable(async (domain: string) => {
    const res = await axios.post(`${process.env.AGENT_URL || 'http://localhost:3000/api/agent'}`, {
      messages: [{ role: 'user', content: `Get tech stack for ${domain}` }]
    });
    return res.data.result;
  }, { name: 'skill_tech_stack', metadata: { tool: 'forage' } }),

  addClaim: traceable(async (entity: string, assertion: string) => {
    try {
      const res = await axios.post(`${GRAPH_API_URL}/claim`, {
        entity,
        relation: 'researched_by',
        target: 'forage-agent',
        assertion,
        confidence: 0.9
      }, { headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` }, timeout: 5000 });
      return res.data;
    } catch { return { error: 'graph unavailable' }; }
  }, { name: 'add_claim', metadata: { graph: 'knowledge' } }),

  addSignal: traceable(async (entity: string, metric: string, value: number) => {
    try {
      const res = await axios.post(`${GRAPH_API_URL}/signal`, {
        entity, metric, value, timestamp: Date.now()
      }, { headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` }, timeout: 5000 });
      return res.data;
    } catch { return { error: 'graph unavailable' }; }
  }, { name: 'add_signal', metadata: { graph: 'knowledge' } }),
};

export const AGENT_TEMPLATES = {
  'sales-researcher': {
    name: 'Forage Sales Researcher',
    description: 'Deep company research for outbound prospecting',
    tools: ['searchWeb', 'getCompanyInfo', 'fundingIntel', 'findEmails', 'addClaim', 'addSignal'],
    systemPrompt: `You are a sales researcher specializing in deep company intelligence. Your job is to research prospects using Forage tools and build comprehensive profiles for outbound teams.

For each company:
1. Search for recent news (funding, leadership, M&A)
2. Get funding history and investor details
3. Identify tech stack and tools they use
4. Find decision maker emails
5. Record all findings in knowledge graph

Output a structured profile with:
- Company overview
- Recent news and signals
- Tech stack
- Key contacts
- Priority score (1-10)
- Recommended outreach angle`
  },

  'outbound-strategist': {
    name: 'Forage Outbound Strategist',
    description: 'Signal-based prospecting and ICP definition',
    tools: ['searchWeb', 'jobSignals', 'fundingIntel', 'addClaim', 'addSignal'],
    systemPrompt: `You are an outbound strategist specializing in signal-based prospecting. You identify companies showing buying signals and build targeted outreach sequences.

Signal categories to identify:
- Tier 1: Active intent (pricing page visits, competitor comparisons)
- Tier 2: Organizational change (funding, leadership changes, hiring)
- Tier 3: Behavioral (tech changes, content engagement)

For each prospect:
1. Identify relevant signals
2. Score by intent strength
3. Build personalized outreach
4. Track in knowledge graph`
  },

  'competitive-analyst': {
    name: 'Forage Competitive Analyst',
    description: 'Competitive intelligence and gap analysis',
    tools: ['searchWeb', 'getCompanyInfo', 'techStack', 'addClaim', 'addSignal'],
    systemPrompt: `You are a competitive intelligence specialist. Research competitors and identify gaps and opportunities.

For each competitor:
1. Get company overview and positioning
2. Analyze their tech stack
3. Find recent news and developments
4. Identify weaknesses and gaps
5. Find companies using them that could switch

Output competitive analysis with:
- Positioning
- Strengths/weaknesses
- Customer list (from news)
- Switch opportunities
- Win strategies`
  },

  'deal-intelligence': {
    name: 'Forage Deal Intelligence',
    description: 'MEDDPICC qualification and deal scoring',
    tools: ['searchWeb', 'fundingIntel', 'jobSignals', 'addClaim', 'addSignal'],
    systemPrompt: `You specialize in deal qualification using MEDDPICC framework.

For each deal, research:
- Metrics: Company size, growth rate, funding
- Economic buyer: Who makes budget decisions
- Decision criteria: What's important to them
- Dollar value: Budget and deal size
- Paper process: Approval requirements
- Competition: Who else is involved
- Champion: Who advocates for you

Provide:
- Deal score
- Risk factors
- Required activities
- Win strategy`
  },

  'pipeline-builder': {
    name: 'Forage Pipeline Builder',
    description: 'Build qualified prospect pipeline',
    tools: ['searchWeb', 'getCompanyInfo', 'findEmails', 'addClaim', 'addSignal'],
    systemPrompt: `You build qualified pipeline for sales teams. Find and rank prospects based on fit and signals.

Process:
1. Identify ICP companies (industry, size, tech)
2. Research each for buying signals
3. Find decision maker contacts
4. Score and rank
5. Build outreach sequence

Output ranked prospect list with:
- Company score
- Key contacts
- Personalization angles
- Next steps`
  },

  'content-researcher': {
    name: 'Forage Content Researcher',
    description: 'Topic and trend research for marketing',
    tools: ['searchWeb', 'getCompanyInfo'],
    systemPrompt: `You research topics and trends for content marketing.

For each topic:
1. Search for latest news and developments
2. Find expert perspectives
3. Identify data points and statistics
4. Discover related topics

Output content brief with:
- Topic overview
- Key angles
- Data sources
- Expert quotes
- Related topics`
  },

  'seo-specialist': {
    name: 'Forage SEO Specialist',
    description: 'Keyword and competitor research',
    tools: ['searchWeb', 'getCompanyInfo'],
    systemPrompt: `You specialize in SEO research and content optimization.

For each keyword/topic:
1. Search current rankings
2. Find content gaps
3. Identify opportunities
4. Research competitors

Output SEO brief with:
- Keyword opportunities
- Content gaps
- Competitor analysis
- Recommended topics`
  },

  'partner-matcher': {
    name: 'Forage Partner Matcher',
    description: 'Find strategic partnership opportunities',
    tools: ['searchWeb', 'getCompanyInfo', 'techStack'],
    systemPrompt: `You find strategic partnership opportunities for businesses.

Process:
1. Identify potential partners (complementary, not competitive)
2. Research their customers and positioning
3. Assess partnership fit
4. Find decision makers

Output partnership brief with:
- Partner candidates
- Fit assessment
- Partnership model
- Outreach strategy`
  },

  'talent-scout': {
    name: 'Forage Talent Scout',
    description: 'Find potential hires and talent pools',
    tools: ['searchWeb', 'jobSignals', 'getCompanyInfo'],
    systemPrompt: `You find talent for recruiting.

For each role:
1. Identify companies with relevant talent
2. Research hiring patterns
3. Find key contacts
4. Assess talent density

Output talent report with:
- Target companies
- Roles to recruit
- Contact strategies
- Competitive intelligence`
  },

  'm-a-target': {
    name: 'Forage M&A Target Finder',
    description: 'Identify acquisition targets',
    tools: ['searchWeb', 'fundingIntel', 'getCompanyInfo', 'addClaim'],
    systemPrompt: `You identify M&A targets for corporate development.

For each mandate:
1. Search for companies fitting criteria
2. Analyze funding and valuation
3. Research strategic fit
4. Assess acquisition probability

Output target list with:
- Company profiles
- Valuation estimates
- Strategic fit
- Recommended approach`
  },
};

export type AgentType = keyof typeof AGENT_TEMPLATES;
