import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createForageTools, ForageClient, forageClient } from './forage-tools';
import { FORAGE_AGENTS, DEPARTMENTS, ForageAgentType } from './forage-agents';

const llm = new ChatOpenAI({
  model: 'deepseek-chat',
  temperature: 0.7,
  apiKey: process.env.DEEPSEEK_API_KEY,
  configuration: { baseURL: 'https://api.deepseek.com/v1' },
});

export interface AgentRequest {
  agentType?: string;
  department?: string;
  query: string;
  domain?: string;
  company?: string;
  context?: Record<string, any>;
}

export interface AgentResponse {
  agentType: string;
  department?: string;
  result: string;
  tools: string[];
  claims?: any[];
  signals?: any[];
  metadata?: Record<string, any>;
}

const DEPARTMENT_ROUTING = {
  SALES: {
    primary: 'sales-engineer',
    secondary: ['outbound-strategist', 'deal-strategist', 'pipeline-analyst'],
    tools: ['search_web', 'get_company_info', 'skill_funding_intel', 'find_emails', 'skill_job_signals', 'skill_tech_stack', 'add_claim', 'add_signal']
  },
  MARKETING: {
    primary: 'social-media-strategist',
    secondary: ['seo-specialist', 'content-creator', 'growth-hacker'],
    tools: ['search_web', 'get_company_info', 'skill_funding_intel', 'skill_job_signals', 'add_claim', 'add_signal']
  },
  PRODUCT: {
    primary: 'product-manager',
    secondary: ['trend-researcher', 'feedback-synthesizer', 'sprint-prioritizer'],
    tools: ['search_web', 'get_company_info', 'skill_funding_intel', 'skill_job_signals', 'skill_tech_stack', 'add_claim', 'add_signal']
  },
  ENGINEERING: {
    primary: 'software-architect',
    secondary: ['senior-developer', 'devops-automator', 'security-engineer'],
    tools: ['search_web', 'get_company_info', 'skill_tech_stack', 'skill_job_signals', 'add_claim', 'add_signal']
  },
  OPERATIONS: {
    primary: 'workflow-architect',
    secondary: ['vendor-evaluator', 'compliance-auditor', 'process-mining'],
    tools: ['search_web', 'get_company_info', 'skill_funding_intel', 'skill_tech_stack', 'add_claim', 'add_signal']
  },
  HR: {
    primary: 'recruitment-specialist',
    secondary: ['talent-scout', 'compensation-benchmarker', 'corporate-training-designer'],
    tools: ['search_web', 'get_company_info', 'skill_job_signals', 'find_emails', 'add_claim', 'add_signal']
  },
  FINANCE: {
    primary: 'finance-tracker',
    secondary: ['budget-tracker', 'revenue-intel', 'cost-optimization'],
    tools: ['search_web', 'get_company_info', 'skill_funding_intel', 'add_claim', 'add_signal']
  },
  DESIGN: {
    primary: 'ux-architect',
    secondary: ['ui-designer', 'visual-storyteller', 'image-prompt-engineer'],
    tools: ['search_web', 'get_company_info', 'add_claim']
  },
  GAMING: {
    primary: 'unity-architect',
    secondary: ['unreal-systems-engineer', 'narrative-designer', 'game-audio-engineer'],
    tools: ['search_web', 'get_company_info', 'skill_job_signals', 'add_claim']
  },
  EXECUTIVE: {
    primary: 'executive-summary-generator',
    secondary: ['discovery-coach', 'agents-orchestrator'],
    tools: ['search_web', 'get_company_info', 'skill_funding_intel', 'skill_job_signals', 'add_claim', 'add_signal']
  },
  SPECIALIZED: {
    primary: 'ai-engineer',
    secondary: ['blockchain-security-auditor', 'healthcare-marketing-compliance-specialist'],
    tools: ['search_web', 'get_company_info', 'skill_tech_stack', 'add_claim', 'add_signal']
  }
};

const MASTER_PROMPT = `You are the Forage Master Orchestrator - the central intelligence that routes tasks to specialized department agents.

Your role:
1. Analyze the user's request to determine the appropriate department
2. Select the best agent for the specific task
3. Coordinate between agents when needed
4. Synthesize results into actionable insights
5. Always explain your reasoning from the Forage world-model perspective

Department capabilities:
- SALES: Revenue generation, deal qualification, outbound strategy, account mapping
- MARKETING: Content, SEO, paid media, social strategy, growth
- PRODUCT: Strategy, roadmapping, user research, feature prioritization  
- ENGINEERING: Development, architecture, security, DevOps
- OPERATIONS: Process optimization, vendor management, compliance
- HR: Recruiting, training, compensation, culture
- FINANCE: Budget, revenue, cost optimization, accounting
- DESIGN: UI/UX, visual design, creative strategy
- GAMING: Game development, Unity/Unreal, narrative design
- EXECUTIVE: Strategy, leadership, advisory
- SPECIALIZED: Niche expertise (blockchain, healthcare AI, etc.)

When multiple departments are involved, coordinate between them and provide a unified response.

Always use Forage tools to gather real data before answering. Synthesize findings with causal reasoning.`;

const departmentToolMap = new Map(createForageTools().map(t => [t.name, t]));

function getDepartmentTools(department: string) {
  const dept = DEPARTMENT_ROUTING[department as keyof typeof DEPARTMENT_ROUTING];
  if (!dept) return createForageTools();
  return dept.tools.map(name => departmentToolMap.get(name)).filter(Boolean) as any[];
}

function getAgentPrompt(agentType: string): string {
  const agent = FORAGE_AGENTS[agentType as ForageAgentType];
  if (!agent) {
    return `You are a specialized Forage agent. Use available tools to complete the task.`;
  }
  return agent.prompt;
}

export async function executeAgent(request: AgentRequest): Promise<AgentResponse> {
  const { agentType, department, query, domain, company, context } = request;
  
  let selectedAgentType = agentType;
  let selectedDept = department;
  
  if (!selectedAgentType && selectedDept) {
    const routing = DEPARTMENT_ROUTING[selectedDept as keyof typeof DEPARTMENT_ROUTING];
    selectedAgentType = routing?.primary || 'sales-engineer';
  }
  
  if (!selectedDept && selectedAgentType) {
    for (const [dept, config] of Object.entries(DEPARTMENT_ROUTING)) {
      if (config.primary === selectedAgentType || config.secondary.includes(selectedAgentType)) {
        selectedDept = dept;
        break;
      }
    }
  }
  
  const tools = getDepartmentTools(selectedDept || 'SALES');
  const systemPrompt = `${MASTER_PROMPT}\n\nYou are acting as: ${selectedAgentType}\n\n${getAgentPrompt(selectedAgentType || 'sales-engineer')}`;
  
  const prompt = `${systemPrompt}

Task: ${query}
${domain ? `Domain: ${domain}` : ''}
${company ? `Company: ${company}` : ''}
${context ? `Context: ${JSON.stringify(context)}` : ''}

Use the available tools to gather information and provide your analysis.`;

  const promptTemplate = ChatPromptTemplate.fromTemplate(prompt);
  
  const agent = await createStructuredChatAgent({
    llm,
    tools,
    prompt: promptTemplate
  });
  const executor = new AgentExecutor({ agent, tools, verbose: true });
  
  const result = await executor.invoke({ input: query });
  
  return {
    agentType: selectedAgentType || 'sales-engineer',
    department: selectedDept,
    result: result.output,
    tools: tools.map(t => t.name)
  };
}

export async function executeDepartment(request: AgentRequest): Promise<AgentResponse[]> {
  const { department, query, domain, company, context } = request;
  
  if (!department) {
    const result = await executeAgent(request);
    return [result];
  }
  
  const routing = DEPARTMENT_ROUTING[department as keyof typeof DEPARTMENT_ROUTING];
  if (!routing) {
    const result = await executeAgent({ ...request, department: 'SALES' });
    return [result];
  }
  
  const results: AgentResponse[] = [];
  
  for (const agentType of [routing.primary, ...routing.secondary]) {
    try {
      const result = await executeAgent({ ...request, agentType });
      results.push(result);
    } catch (e: any) {
      results.push({
        agentType,
        department,
        result: `Error: ${e.message}`,
        tools: []
      });
    }
  }
  
  return results;
}

export async function executeWithHandoffs(request: AgentRequest): Promise<AgentResponse> {
  const results = await executeDepartment(request);
  
  const synthesis = results.map(r => `[${r.agentType}]: ${r.result.slice(0, 200)}`).join('\n\n');
  
  return {
    agentType: 'agents-orchestrator',
    department: request.department,
    result: `## Synthesized Results\n\n${synthesis}\n\n## Recommendation\n\n${results[0]?.result || 'No results'}`,
    tools: [...new Set(results.flatMap(r => r.tools))]
  };
}

export { DEPARTMENT_ROUTING, MASTER_PROMPT };
