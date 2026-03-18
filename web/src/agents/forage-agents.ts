import * as fs from 'fs';
import * as path from 'path';

interface AgentDefinition {
  name: string;
  description: string;
  color: string;
  mode: string;
  instructions: string;
}

const TOOLS = {
  SALES: ['search_web', 'get_company_info', 'skill_funding_intel', 'find_emails', 'skill_job_signals', 'skill_tech_stack', 'add_claim', 'add_signal'],
  MARKETING: ['search_web', 'get_company_info', 'skill_funding_intel', 'skill_job_signals', 'add_claim', 'add_signal'],
  PRODUCT: ['search_web', 'get_company_info', 'skill_funding_intel', 'skill_job_signals', 'skill_tech_stack', 'add_claim', 'add_signal'],
  ENGINEERING: ['search_web', 'get_company_info', 'skill_tech_stack', 'skill_job_signals', 'add_claim', 'add_signal'],
  OPERATIONS: ['search_web', 'get_company_info', 'skill_funding_intel', 'skill_tech_stack', 'add_claim', 'add_signal'],
  HR: ['search_web', 'get_company_info', 'skill_job_signals', 'find_emails', 'add_claim', 'add_signal'],
  FINANCE: ['search_web', 'get_company_info', 'skill_funding_intel', 'add_claim', 'add_signal'],
  DESIGN: ['search_web', 'get_company_info', 'add_claim'],
  GAMING: ['search_web', 'get_company_info', 'skill_job_signals', 'add_claim'],
  EXEC: ['search_web', 'get_company_info', 'skill_funding_intel', 'skill_job_signals', 'add_claim', 'add_signal'],
};

function parseYamlFrontmatter(content: string): AgentDefinition | null {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  const frontmatter = match[1];
  const instructions = match[2];
  const nameMatch = frontmatter.match(/name:\s*(.+)/);
  const descMatch = frontmatter.match(/description:\s*(.+)/);
  const colorMatch = frontmatter.match(/color:\s*(.+)/);
  const modeMatch = frontmatter.match(/mode:\s*(.+)/);
  if (!nameMatch) return null;
  return {
    name: nameMatch[1].trim(),
    description: descMatch ? descMatch[1].trim() : '',
    color: colorMatch ? colorMatch[1].trim() : '#6B7280',
    mode: modeMatch ? modeMatch[1].trim() : 'subagent',
    instructions: instructions.trim().slice(0, 3000)
  };
}

function getToolsForAgent(agentName: string): string[] {
  const name = agentName.toLowerCase();
  if (name.includes('sales') || name.includes('outbound') || name.includes('deal') || name.includes('pipeline') || name.includes('account') || name.includes('proposal') || name.includes('demo') || name.includes('renewal') || name.includes('expansion') || name.includes('cold') || name.includes('partner')) return TOOLS.SALES;
  if (name.includes('marketing') || name.includes('content') || name.includes('seo') || name.includes('campaign') || name.includes('influencer') || name.includes('social') || name.includes('paid') || name.includes('ppc') || name.includes('brand') || name.includes('growth') || name.includes('podcast') || name.includes('ad') || name.includes('media')) return TOOLS.MARKETING;
  if (name.includes('product') || name.includes('prd') || name.includes('roadmap') || name.includes('feature') || name.includes('launch') || name.includes('beta') || name.includes('churn') || name.includes('feedback')) return TOOLS.PRODUCT;
  if (name.includes('engineer') || name.includes('developer') || name.includes('code') || name.includes('devops') || name.includes('sre') || name.includes('security') || name.includes('technical') || name.includes('architecture') || name.includes('backend') || name.includes('frontend') || name.includes('mobile') || name.includes('api') || name.includes('database') || name.includes('firmware') || name.includes('software')) return TOOLS.ENGINEERING;
  if (name.includes('operation') || name.includes('vendor') || name.includes('supply') || name.includes('compliance') || name.includes('process') || name.includes('automation') || name.includes('infrastructure')) return TOOLS.OPERATIONS;
  if (name.includes('hr') || name.includes('talent') || name.includes('recruit') || name.includes('hiring') || name.includes('compensation') || name.includes('culture') || name.includes('training') || name.includes('benefit')) return TOOLS.HR;
  if (name.includes('finance') || name.includes('financial') || name.includes('budget') || name.includes('revenue') || name.includes('cost') || name.includes('audit') || name.includes('account') || name.includes('payment') || name.includes('data')) return TOOLS.FINANCE;
  if (name.includes('design') || name.includes('ui') || name.includes('ux') || name.includes('visual') || name.includes('image') || name.includes('creative')) return TOOLS.DESIGN;
  if (name.includes('game') || name.includes('unity') || name.includes('unreal') || name.includes('roblox') || name.includes('xr') || name.includes('spatial') || name.includes('ar') || name.includes('vr')) return TOOLS.GAMING;
  return TOOLS.EXEC;
}

function generateAgentsFromRepo(): Record<string, any> {
  const baseDir = path.join(process.cwd(), '..', 'agency-agents');
  const agentsDir = path.join(baseDir, 'integrations', 'opencode', 'agents');
  const agents: Record<string, any> = {};
  
  if (fs.existsSync(agentsDir)) {
    const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(agentsDir, file), 'utf-8');
      const agent = parseYamlFrontmatter(content);
      if (agent) {
        const slug = file.replace('.md', '');
        agents[slug] = { name: agent.name, description: agent.description, color: agent.color, tools: getToolsForAgent(agent.name), prompt: agent.instructions };
      }
    }
  }
  
  const categoryDirs = ['sales', 'marketing', 'product', 'engineering', 'support', 'operations', 'hr', 'finance', 'design', 'gaming', 'project-management', 'paid-media', 'specialized', 'spatial-computing'];
  for (const catDir of categoryDirs) {
    const catPath = path.join(baseDir, catDir);
    if (!fs.existsSync(catPath)) continue;
    const files = fs.readdirSync(catPath).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(catPath, file), 'utf-8');
      const agent = parseYamlFrontmatter(content);
      if (agent) {
        let slug = file.replace('.md', '').replace(/^support-/, '').replace(/^project-management-/, '').replace(/^paid-media-/, '').replace(/^specialized-/, '').replace(/^product-/, '').replace(/^marketing-/, '');
        if (!agents[slug]) {
          agents[slug] = { name: agent.name, description: agent.description, color: agent.color, tools: getToolsForAgent(agent.name), prompt: agent.instructions };
        }
      }
    }
  }
  return agents;
}

export const FORAGE_AGENTS = generateAgentsFromRepo();

export const DEPARTMENTS = {
  SALES: {
    name: 'Sales Department',
    color: '#10B981',
    role: 'Revenue Generation',
    employees: [
      'sales-engineer', 'outbound-strategist', 'deal-strategist', 'pipeline-analyst', 
      'proposal-strategist', 'account-strategist', 'sales-coach', 'sales-data-extraction-agent',
      'report-distribution-agent', 'recruitment-specialist'
    ]
  },
  MARKETING: {
    name: 'Marketing Department',
    color: '#F59E0B',
    role: 'Brand & Growth',
    employees: [
      'content-creator', 'seo-specialist', 'social-media-strategist', 'growth-hacker',
      'paid-media-auditor', 'ppc-campaign-strategist', 'paid-social-strategist',
      'programmatic-display-buyer', 'influencer-finder', 'brand-guardian', 'podcast-strategist',
      'ad-creative-strategist', 'search-query-analyst', 'tracking-measurement-specialist'
    ]
  },
  PRODUCT: {
    name: 'Product Department',
    color: '#3B82F6',
    role: 'Product Strategy & Research',
    employees: [
      'product-manager', 'trend-researcher', 'sprint-prioritizer', 'feedback-synthesizer',
      'behavioral-nudge-engine', 'project-shepherd', 'jira-workflow-steward', 'experiment-tracker'
    ]
  },
  ENGINEERING: {
    name: 'Engineering Department',
    color: '#EF4444',
    role: 'Development & Infrastructure',
    employees: [
      'software-architect', 'senior-developer', 'frontend-developer', 'backend-developer',
      'mobile-app-builder', 'devops-automator', 'sre-site-reliability-engineer',
      'security-engineer', 'database-optimizer', 'code-reviewer', 'technical-writer',
      'mcp-builder', 'api-tester', 'evidence-collector', 'performance-benchmarker',
      'reality-checker', 'tool-evaluator', 'test-results-analyzer', 'lsp-index-engineer',
      'rapid-prototyper', 'technical-artist'
    ]
  },
  OPERATIONS: {
    name: 'Operations Department',
    color: '#8B5CF6',
    role: 'Process & Efficiency',
    employees: [
      'workflow-architect', 'workflow-optimizer', 'vendor-evaluator', 'infrastructure-maintainer',
      'compliance-auditor', 'process-mining', 'automation-governance-architect',
      'devops-automator', 'document-generator', 'report-distribution-agent'
    ]
  },
  HR: {
    name: 'Human Resources',
    color: '#EC4899',
    role: 'People & Culture',
    employees: [
      'recruitment-specialist', 'corporate-training-designer', 'org-design', 'talent-scout',
      'compensation-benchmarker', 'study-abroad-advisor', 'cultural-intelligence-strategist'
    ]
  },
  FINANCE: {
    name: 'Finance Department',
    color: '#14B8A6',
    role: 'Financial Strategy',
    employees: [
      'finance-tracker', 'accounts-payable-agent', 'budget-tracker', 'revenue-intel',
      'cost-optimization', 'data-consolidation-agent', 'analytics-reporter'
    ]
  },
  DESIGN: {
    name: 'Design Department',
    color: '#F97316',
    role: 'Creative & UX',
    employees: [
      'ui-designer', 'ux-architect', 'ux-researcher', 'visual-storyteller',
      'image-prompt-engineer', 'inclusive-visuals-specialist', 'narrative-designer',
      'level-designer', 'game-designer'
    ]
  },
  GAMING: {
    name: 'Gaming Division',
    color: '#22C55E',
    role: 'Game Development',
    employees: [
      'unity-architect', 'unreal-systems-engineer', 'roblox-systems-scripter',
      'game-audio-engineer', 'godot-gameplay-scripter', 'godot-shader-developer',
      'blender-add-on-engineer', 'terminal-integration-specialist'
    ]
  },
  EXECUTIVE: {
    name: 'Executive Suite',
    color: '#000000',
    role: 'Strategy & Leadership',
    employees: [
      'executive-summary-generator', 'discovery-coach', 'agents-orchestrator',
      'agentic-identity-trust-architect', 'government-digital-presales-consultant',
      'french-consulting-market-navigator', 'korean-business-navigator', 'cross-border-e-commerce-specialist',
      'china-e-commerce-operator'
    ]
  },
  SPECIALIZED: {
    name: 'Specialized Units',
    color: '#6366F1',
    role: 'Niche Expertise',
    employees: [
      'blockchain-security-auditor', 'solidity-smart-contract-engineer', 'healthcare-marketing-compliance-specialist',
      'ai-engineer', 'ai-data-remediation-engineer', 'ai-citation-strategist', 'model-qa-specialist',
      'threat-detection-engineer', 'zk-steward', 'supply-chain-strategist', 'identity-graph-operator'
    ]
  }
};

export type ForageAgentType = keyof typeof FORAGE_AGENTS;

export const getAgentTools = (agentType: string): string[] => {
  const agent = FORAGE_AGENTS[agentType as ForageAgentType];
  return agent?.tools || TOOLS.EXEC;
};

export const getAgentSystemPrompt = (agentType: string): string => {
  const agent = FORAGE_AGENTS[agentType as ForageAgentType];
  return agent?.prompt || 'You are a research assistant. Use available Forage tools to gather information.';
};

export const getAgentInfo = (agentType: string) => FORAGE_AGENTS[agentType as ForageAgentType] || null;

export const listDepartments = () => {
  return Object.entries(DEPARTMENTS).map(([id, dept]) => ({
    id,
    name: dept.name,
    color: dept.color,
    role: dept.role,
    employeeCount: dept.employees.filter(e => FORAGE_AGENTS[e as ForageAgentType]).length
  }));
};

export const getDepartmentEmployees = (deptId: string) => {
  const dept = DEPARTMENTS[deptId as keyof typeof DEPARTMENTS];
  if (!dept) return [];
  return dept.employees.map(slug => FORAGE_AGENTS[slug as ForageAgentType]).filter(Boolean);
};

export const listAllAgents = () => {
  return Object.entries(FORAGE_AGENTS).map(([slug, agent]) => ({
    slug,
    name: agent.name,
    description: agent.description,
    color: agent.color,
    tools: agent.tools
  }));
};

export const searchAgents = (query: string) => {
  const q = query.toLowerCase();
  return Object.entries(FORAGE_AGENTS)
    .filter(([slug, a]) => slug.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
    .map(([slug, agent]) => ({ slug, name: agent.name, description: agent.description, color: agent.color }));
};
