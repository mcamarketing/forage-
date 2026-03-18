import { NextRequest, NextResponse } from 'next/server';
import { runSalesResearch, runTerritoryScan, runCompetitiveIntel } from '../../../agents/sales-agent';
import { getLangchainCallbacks } from 'langsmith/langchain';

export async function POST(req: NextRequest) {
  let tracersCleanedUp = false;
  
  const cleanupTracers = async () => {
    if (tracersCleanedUp) return;
    tracersCleanedUp = true;
    try {
      const callbacks = await getLangchainCallbacks();
      if (callbacks) {
        await callbacks.waitFor();
      }
    } catch (e) {
      console.error('Error cleaning up tracers:', e);
    }
  };

  process.on('beforeExit', cleanupTracers);

  try {
    const body = await req.json();
    const { action, company, domain, keyword, location, competitor } = body;

    let result: string;

    switch (action) {
      case 'research':
        if (!company) {
          await cleanupTracers();
          return NextResponse.json({ error: 'company is required' }, { status: 400 });
        }
        result = await runSalesResearch(company, domain);
        break;
      
      case 'territory':
        if (!keyword || !location) {
          await cleanupTracers();
          return NextResponse.json({ error: 'keyword and location are required' }, { status: 400 });
        }
        result = await runTerritoryScan(keyword, location);
        break;
      
      case 'competitive':
        if (!competitor) {
          await cleanupTracers();
          return NextResponse.json({ error: 'competitor is required' }, { status: 400 });
        }
        result = await runCompetitiveIntel(competitor);
        break;
      
      default:
        await cleanupTracers();
        return NextResponse.json({ error: 'Invalid action. Use: research, territory, or competitive' }, { status: 400 });
    }

    await cleanupTracers();
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Sales agent error:', error);
    await cleanupTracers();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
