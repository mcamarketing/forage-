import { NextRequest, NextResponse } from 'next/server';
import { FORAGE_AGENTS, DEPARTMENTS, getAgentTools, getAgentSystemPrompt, getAgentInfo, listDepartments, getDepartmentEmployees, listAllAgents, searchAgents, ForageAgentType } from '../../../agents/forage-agents';
import { createForageTools, FORAGE_TOOLS } from '../../../agents/forage-tools';
import { executeAgent, executeDepartment, DEPARTMENT_ROUTING } from '../../../agents/orchestrator';

const API_KEY = process.env.FORAGE_AGENT_API_KEY;

const toolMap = new Map(FORAGE_TOOLS.map(t => [t.name, t]));

function getToolsForAgentType(agentType: string) {
  const toolNames = getAgentTools(agentType);
  return toolNames.map(name => toolMap.get(name)).filter(Boolean) as any[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  
  if (action === 'departments') {
    return NextResponse.json({ departments: listDepartments() });
  }
  
  if (action === 'employees' && searchParams.get('dept')) {
    const dept = searchParams.get('dept')!.toUpperCase();
    return NextResponse.json({ 
      department: DEPARTMENTS[dept as keyof typeof DEPARTMENTS], 
      employees: getDepartmentEmployees(dept) 
    });
  }
  
  if (action === 'squads') {
    return NextResponse.json({ squads: Object.entries(DEPARTMENT_ROUTING).map(([id, sq]) => ({ id, primary: sq.primary, agents: [sq.primary, ...sq.secondary] })) });
  }
  
  if (action === 'search' && searchParams.get('q')) {
    return NextResponse.json({ results: searchAgents(searchParams.get('q')!) });
  }
  
  if (action === 'agent' && searchParams.get('id')) {
    const agent = getAgentInfo(searchParams.get('id')!);
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    return NextResponse.json({ agent });
  }
  
  return NextResponse.json({ 
    message: 'Forage Agent API - AI Employee Army',
    agents: listAllAgents().length,
    departments: listDepartments().map(d => ({ id: d.id, name: d.name, employees: d.employeeCount })),
    squads: Object.keys(DEPARTMENT_ROUTING),
    endpoints: {
      GET: {
        '?action=departments': 'List all departments',
        '?action=squads': 'List department squads',
        '?action=employees&dept=SALES': 'Get employees in department',
        '?action=search&q=email': 'Search agents',
        '?action=agent&id=sales-engineer': 'Get specific agent'
      },
      POST: {
        '/': 'Run single agent: {agentType, query}',
        '/department': 'Run full department: {department, query}',
        '/orchestrate': 'Multi-agent synthesis'
      }
    }
  });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!API_KEY || authHeader !== `Bearer ${API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const { agentType, query, domain, company, department, mode } = body;
    
    if (mode === 'department' && department) {
      const results = await executeDepartment({ department, query, domain, company });
      return NextResponse.json({ mode: 'department', department, results });
    }
    
    if (mode === 'orchestrate' && department) {
      const results = await executeDepartment({ department, query, domain, company });
      const synthesis = results.map(r => `[${r.agentType}]: ${r.result.slice(0, 300)}`).join('\n\n');
      return NextResponse.json({ 
        mode: 'orchestrated', 
        department, 
        synthesis,
        results 
      });
    }
    
    const result = await executeAgent({ agentType, query, domain, company });
    return NextResponse.json(result);
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
