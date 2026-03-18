import { DynamicTool } from 'langchain/tools';
import axios from 'axios';

const FORAGE_API_URL = process.env.FORAGE_API_URL || 'https://api.forage.ai';
const FORAGE_API_KEY = process.env.FORAGE_API_KEY;
const GRAPH_API_URL = process.env.GRAPH_API_URL || 'https://forage-graph-production.up.railway.app';
const GRAPH_API_SECRET = process.env.GRAPH_API_SECRET;

export interface ForageCompanyData {
  domain: string;
  name?: string;
  description?: string;
  industry?: string;
  size?: string;
  funding?: any;
  techStack?: string[];
  signals?: any;
  error?: string;
}

export interface ForageSignal {
  entity: string;
  metric: string;
  value: number;
  timestamp?: number;
}

export interface ForageClaim {
  entity: string;
  relation: string;
  target: string;
  assertion: string;
  confidence: number;
}

class ForageClient {
  private baseUrl: string;
  private apiKey: string;
  
  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || FORAGE_API_URL;
    this.apiKey = apiKey || FORAGE_API_KEY || '';
  }
  
  async searchWeb(query: string): Promise<string> {
    try {
      const res = await axios.post(`${this.baseUrl}/api/agent`, {
        messages: [{ role: 'user', content: `Search: ${query}` }]
      }, { timeout: 30000 });
      return res.data.result || JSON.stringify(res.data);
    } catch (e: any) {
      return JSON.stringify({ error: e.message });
    }
  }
  
  async getCompanyInfo(domain: string): Promise<ForageCompanyData> {
    try {
      const res = await axios.post(`${this.baseUrl}/api/agent`, {
        messages: [{ role: 'user', content: `Get company info for ${domain}` }]
      }, { timeout: 30000 });
      return res.data.result || { domain };
    } catch (e: any) {
      return { domain, error: e.message };
    }
  }
  
  async findEmails(domain: string): Promise<string[]> {
    try {
      const res = await axios.post(`${this.baseUrl}/api/agent`, {
        messages: [{ role: 'user', content: `Find emails for ${domain}` }]
      }, { timeout: 30000 });
      return res.data.result || [];
    } catch (e: any) {
      return [];
    }
  }
  
  async getFundingIntel(company: string): Promise<any> {
    try {
      const res = await axios.post(`${this.baseUrl}/api/agent`, {
        messages: [{ role: 'user', content: `Get funding intel for ${company}` }]
      }, { timeout: 30000 });
      return res.data.result || {};
    } catch (e: any) {
      return { error: e.message };
    }
  }
  
  async getJobSignals(company: string): Promise<any> {
    try {
      const res = await axios.post(`${this.baseUrl}/api/agent`, {
        messages: [{ role: 'user', content: `Get job signals for ${company}` }]
      }, { timeout: 30000 });
      return res.data.result || {};
    } catch (e: any) {
      return { error: e.message };
    }
  }
  
  async getTechStack(domain: string): Promise<string[]> {
    try {
      const res = await axios.post(`${this.baseUrl}/api/agent`, {
        messages: [{ role: 'user', content: `Get tech stack for ${domain}` }]
      }, { timeout: 30000 });
      return res.data.result || [];
    } catch (e: any) {
      return [];
    }
  }
  
  async addClaim(claim: ForageClaim): Promise<any> {
    try {
      const res = await axios.post(`${GRAPH_API_URL}/claim`, claim, {
        headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` },
        timeout: 5000
      });
      return res.data;
    } catch (e: any) {
      return { error: e.message };
    }
  }
  
  async addSignal(signal: ForageSignal): Promise<any> {
    try {
      const res = await axios.post(`${GRAPH_API_URL}/signal`, signal, {
        headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` },
        timeout: 5000
      });
      return res.data;
    } catch (e: any) {
      return { error: e.message };
    }
  }
  
  async getClaims(entity: string): Promise<any[]> {
    try {
      const res = await axios.get(`${GRAPH_API_URL}/claims/${entity}`, {
        headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` },
        timeout: 5000
      });
      return res.data || [];
    } catch (e: any) {
      return [];
    }
  }
  
  async getSignals(entity: string): Promise<ForageSignal[]> {
    try {
      const res = await axios.get(`${GRAPH_API_URL}/signals/${entity}`, {
        headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` },
        timeout: 5000
      });
      return res.data || [];
    } catch (e: any) {
      return [];
    }
  }
  
  async getRegime(entity: string): Promise<any> {
    try {
      const res = await axios.get(`${GRAPH_API_URL}/regime/${entity}`, {
        headers: { Authorization: `Bearer ${GRAPH_API_SECRET}` },
        timeout: 5000
      });
      return res.data || {};
    } catch (e: any) {
      return { error: e.message };
    }
  }
}

const forageClient = new ForageClient();

export const createForageTools = (client?: ForageClient): DynamicTool[] => {
  const fc = client || forageClient;
  
  return [
    new DynamicTool({
      name: 'search_web',
      description: 'Search the web for current information, news, data, and trends. Use for real-time research.',
      func: async (query: string) => JSON.stringify(await fc.searchWeb(query))
    }),
    new DynamicTool({
      name: 'get_company_info',
      description: 'Get comprehensive company data: name, description, industry, size, funding, key contacts. Essential for sales research.',
      func: async (domain: string) => JSON.stringify(await fc.getCompanyInfo(domain))
    }),
    new DynamicTool({
      name: 'find_emails',
      description: 'Find verified work emails for people at a company. Returns array of {name, email, title}.',
      func: async (domain: string) => JSON.stringify(await fc.findEmails(domain))
    }),
    new DynamicTool({
      name: 'skill_funding_intel',
      description: 'Get funding history, investors, valuation changes, and financial signals. Critical for deal qualification.',
      func: async (company: string) => JSON.stringify(await fc.getFundingIntel(company))
    }),
    new DynamicTool({
      name: 'skill_job_signals',
      description: 'Analyze job listings to reveal hiring strategy, growth areas, and team expansion. Predicts company trajectory.',
      func: async (company: string) => JSON.stringify(await fc.getJobSignals(company))
    }),
    new DynamicTool({
      name: 'skill_tech_stack',
      description: 'Detect technologies and platforms a company uses. Reveals integration opportunities and tech debt.',
      func: async (domain: string) => JSON.stringify(await fc.getTechStack(domain))
    }),
    new DynamicTool({
      name: 'add_claim',
      description: 'Record a factual finding in the knowledge graph. Input: {entity, assertion, relation?}',
      func: async (args: string) => {
        const { entity, assertion, relation } = JSON.parse(args);
        return JSON.stringify(await fc.addClaim({ entity, relation: relation || 'researched_by', target: 'forage-agent', assertion, confidence: 0.9 }));
      }
    }),
    new DynamicTool({
      name: 'add_signal',
      description: 'Track a quantitative metric in the knowledge graph. Input: {entity, metric, value}',
      func: async (args: string) => {
        const { entity, metric, value } = JSON.parse(args);
        return JSON.stringify(await fc.addSignal({ entity, metric, value, timestamp: Date.now() }));
      }
    }),
    new DynamicTool({
      name: 'get_claims',
      description: 'Retrieve previously recorded claims about an entity from knowledge graph.',
      func: async (entity: string) => JSON.stringify(await fc.getClaims(entity))
    }),
    new DynamicTool({
      name: 'get_signals',
      description: 'Retrieve tracked metrics and signals for an entity from knowledge graph.',
      func: async (entity: string) => JSON.stringify(await fc.getSignals(entity))
    }),
    new DynamicTool({
      name: 'get_regime',
      description: 'Get the current operational regime/trends for an entity. Reveals stability, growth, or risk.',
      func: async (entity: string) => JSON.stringify(await fc.getRegime(entity))
    }),
  ];
};

export const FORAGE_TOOLS = createForageTools();

export { ForageClient, forageClient };

export const TOOL_DESCRIPTIONS = {
  search_web: 'Web search for news, data, trends',
  get_company_info: 'Company research & profile',
  find_emails: 'Email discovery',
  skill_funding_intel: 'Funding & valuation data',
  skill_job_signals: 'Hiring strategy analysis',
  skill_tech_stack: 'Technology detection',
  add_claim: 'Record knowledge to graph',
  add_signal: 'Track metrics to graph',
  get_claims: 'Query knowledge graph',
  get_signals: 'Query signal history',
  get_regime: 'Get entity regime/trends'
};
