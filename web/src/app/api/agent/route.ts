import { NextRequest, NextResponse } from 'next/server';

const FORAGE_URL = process.env.FORAGE_URL || "https://ernesta-labs--forage.apify.actor";
const FORAGE_TOKEN = process.env.FORAGE_TOKEN || "";

const tools: Record<string, { description: string; params: string[] }> = {
  search_web: { description: "Search the web", params: ["query", "num_results"] },
  scrape_page: { description: "Scrape a URL", params: ["url"] },
  find_emails: { description: "Find emails for a company", params: ["domain", "limit"] },
  find_leads: { description: "Find B2B leads", params: ["job_title", "location", "industry", "num_leads"] },
  get_company_info: { description: "Get company info", params: ["domain"] },
  skill_company_dossier: { description: "Company dossier", params: ["domain"] },
  skill_market_map: { description: "Market research", params: ["market"] },
  skill_tech_stack: { description: "Tech stack analysis", params: ["domain"] },
};

let sessionId: string | null = null;

async function callForageTool(toolName: string, args: Record<string, unknown>) {
  if (!FORAGE_TOKEN) {
    return { error: "No API token configured" };
  }

  async function makeRequest(body: object, session?: string) {
    const headers: Record<string, string> = { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json, text/event-stream' 
    };
    if (session) headers['mcp-session-id'] = session;
    
    const response = await fetch(`${FORAGE_URL}/?token=${FORAGE_TOKEN}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return response;
  }

  if (!sessionId) {
    const initResponse = await makeRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'forage-landing', version: '1.0' }
      }
    });
    
    sessionId = initResponse.headers.get('mcp-session-id');
  }

  const response = await makeRequest({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: { name: toolName, arguments: args }
  }, sessionId!);

  const text = await response.text();
  
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const data = JSON.parse(line.slice(6));
        if (data.result?.content) {
          const content = data.result.content[0]?.text;
          if (content) {
            return JSON.parse(content);
          }
        }
      } catch {}
    }
  }
  return { error: 'No result' };
}

function detectIntent(text: string): string | null {
  const lower = text.toLowerCase();
  
  if (lower.includes('email') || lower.includes('@') || lower.includes('stripe.com')) {
    return 'find_emails';
  }
  if (lower.includes('lead') || lower.includes('prospect') || lower.includes('director')) {
    return 'find_leads';
  }
  if (lower.includes('search') || lower.includes('find') || lower.includes('look up')) {
    return 'search_web';
  }
  if (lower.includes('scrape') || lower.includes('website') || lower.includes('url')) {
    return 'scrape_page';
  }
  if (lower.includes('market') || lower.includes('competitor') || lower.includes('industry')) {
    return 'skill_market_map';
  }
  if (lower.includes('tech') || lower.includes('stack')) {
    return 'skill_tech_stack';
  }
  if (lower.includes('company') || lower.includes('about')) {
    return 'get_company_info';
  }
  return null;
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const lastMessage = messages?.[messages.length - 1]?.content || '';
  
  const toolName = detectIntent(lastMessage);
  let toolArgs: Record<string, string | number> = {};
  
  if (toolName === 'find_emails' || toolName === 'get_company_info' || toolName === 'skill_company_dossier' || toolName === 'skill_tech_stack') {
    const domainMatch = lastMessage.match(/(\w+\.\w+)/);
    if (domainMatch) toolArgs.domain = domainMatch[1];
  }
  
  if (toolName === 'find_leads') {
    const titleMatch = lastMessage.match(/(marketing director|vp of|sales director|cto|ceo|founder)/i);
    const locMatch = lastMessage.match(/(US|uk|london|sf|new york|usa)/i);
    if (titleMatch) toolArgs.job_title = titleMatch[1];
    if (locMatch) toolArgs.location = locMatch[1];
    toolArgs.num_leads = 10;
  }
  
  if (toolName === 'search_web') {
    const queryMatch = lastMessage.match(/(?:search|find|look up|what is|who is)\s+(.+?)(?:\?|$)/i);
    if (queryMatch) toolArgs.query = queryMatch[1].trim();
    toolArgs.num_results = 5;
  }
  
  if (toolName === 'skill_market_map') {
    const marketMatch = lastMessage.match(/(?:market|industry|competitors|alternatives)\s+(\w+)/i);
    if (marketMatch) toolArgs.market = marketMatch[1];
  }
  
  if (toolName && Object.keys(toolArgs).length > 0) {
    try {
      const result = await callForageTool(toolName, toolArgs);
      
      let summary = `Here's what I found:\n\n`;
      
      if (result.results) {
        summary += `**Results:**\n` + result.results.slice(0, 3).map((r: any) => `- ${r.title}: ${r.snippet?.slice(0, 80)}`).join('\n');
      } else if (result.emails) {
        summary += `**Emails (${result.emails_found}):**\n` + result.emails.slice(0, 5).map((e: any) => `- ${e.name}: ${e.email}`).join('\n');
      } else if (result.leads) {
        summary += `**Leads:**\n` + result.leads.slice(0, 5).map((l: any) => `- ${l.name}: ${l.email}`).join('\n');
      } else if (result.website) {
        summary += `**${result.domain}:**\n- Title: ${result.website?.title}`;
      } else if (result.error) {
        summary += `Error: ${result.error}`;
      }
      
      if (result.cost_usd) {
        summary += `\n\n💰 Cost: $${result.cost_usd}`;
      }
      
      summary += `\n\nWant me to look up something else? Or what's your email to try it yourself?`;
      
      return NextResponse.json({ role: 'assistant', content: summary });
    } catch (err) {
      console.error('Tool error:', err);
    }
  }
  
  const lower = lastMessage.toLowerCase();
  
  if (lower.includes('how') && lower.includes('work')) {
    return NextResponse.json({
      role: 'assistant',
      content: `It works via MCP — add our server to Claude Desktop or any agent. Then call tools like find_leads() directly.\n\nWhat's your email? I'll send your free API key ($1 credit).`
    });
  }
  
  if (lower.includes('price') || lower.includes('cost')) {
    return NextResponse.json({
      role: 'assistant',
      content: `Pay per call: Leads $0.25/100, Emails $0.10, Search $0.03. $1 free credit to try.\n\nWant me to send you an API key?`
    });
  }
  
  return NextResponse.json({
    role: 'assistant',
    content: `I can look up leads, emails, companies, or search the web. What do you need?`
  });
}
