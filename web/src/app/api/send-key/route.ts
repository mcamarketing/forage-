import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { email, apiKey } = await req.json();

    if (!email || !apiKey) {
      return NextResponse.json({ error: 'Missing email or apiKey' }, { status: 400 });
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Forage <onboarding@resend.dev>',
        to: email,
        subject: 'Your Forage API Key - £1 Free Credits Inside',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #8b5cf6; margin-bottom: 24px;">Welcome to Forage!</h1>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">You're in. Here's your API key:</p>

            <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 24px 0; font-family: monospace; font-size: 14px; word-break: break-all;">
              ${apiKey}
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              <strong>You've got £1 free credits</strong> - that's 400 verified B2B leads to test with.
            </p>

            <h2 style="color: #333; margin-top: 32px;">Quick Start</h2>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              <strong>Claude Desktop (MCP):</strong> Add this to your Claude config:
            </p>

            <div style="background: #1e1e1e; color: #d4d4d4; border-radius: 8px; padding: 16px; margin: 16px 0; font-family: monospace; font-size: 13px; overflow-x: auto;">
              <pre style="margin: 0;">{
  "mcpServers": {
    "forage": {
      "command": "npx",
      "args": ["-y", "@anthropic/forage-mcp"],
      "env": { "FORAGE_API_KEY": "${apiKey}" }
    }
  }
}</pre>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              <strong>Direct API:</strong> Use your key in the Authorization header.
            </p>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e4e4e7;">
              <p style="font-size: 14px; color: #71717a;">
                Questions? Reply to this email or chat with us at forage.bot
              </p>
            </div>
          </div>
        `
      })
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Send key error:', e);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
