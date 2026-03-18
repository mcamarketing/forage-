import { NextRequest, NextResponse } from 'next/server';
import { runSalesResearch, runTerritoryScan, runCompetitiveIntel } from '../../agents/sales-agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, company, domain, keyword, location, competitor } = body;

    let result: string;

    switch (action) {
      case 'research':
        if (!company) {
          return NextResponse.json({ error: 'company is required' }, { status: 400 });
        }
        result = await runSalesResearch(company, domain);
        break;
      
      case 'territory':
        if (!keyword || !location) {
          return NextResponse.json({ error: 'keyword and location are required' }, { status: 400 });
        }
        result = await runTerritoryScan(keyword, location);
        break;
      
      case 'competitive':
        if (!competitor) {
          return NextResponse.json({ error: 'competitor is required' }, { status: 400 });
        }
        result = await runCompetitiveIntel(competitor);
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action. Use: research, territory, or competitive' }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Sales agent error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
