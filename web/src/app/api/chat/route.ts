const FLOWISE_API_KEY = process.env.FLOWISE_API_KEY;
const FLOWISE_CHATFLOW_ID = process.env.FLOWISE_CHATFLOW_ID;

interface Message { role: "user" | "assistant"; content: string; }

function extractEmail(text: string): string | null {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0].toLowerCase() : null;
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMsg = messages?.filter((m: Message) => m.role === "user").pop();

  if (!lastMsg) {
    return Response.json({ role: "assistant", content: "Hey! What brings you to Forage today?" });
  }

  const email = extractEmail(lastMsg.content);
  if (email) {
    try {
      const baseUrl = new URL(req.url).origin;
      const signupRes = await fetch(`${baseUrl}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const signupData = await signupRes.json();

      if (signupData.success) {
        if (signupData.isNewUser) {
          await fetch(`${baseUrl}/api/send-key`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, apiKey: signupData.apiKey })
          });

          return Response.json({
            role: "assistant",
            content: `Perfect! I've sent your free API key to ${email} — $1 credit included.\n\nConnect to https://ernesta-labs--forage.apify.actor with header: Authorization: Bearer YOUR_KEY\n\nWhat are you excited to build first?`
          });
        } else {
          const credits = signupData.credits.toFixed(2);
          return Response.json({
            role: "assistant",
            content: `Welcome back! You've got $${credits} in credits. Need help with something?`
          });
        }
      } else {
        return Response.json({
          role: "assistant",
          content: "Hmm, had a small hiccup. Try again or a different email?"
        });
      }
    } catch (e) {
      console.error("Signup error:", e);
      return Response.json({
        role: "assistant",
        content: "Had trouble. What's your email? I'll try again."
      });
    }
  }

  // Try custom agent first
  try {
    const baseUrl = new URL(req.url).origin;
    const res = await fetch(`${baseUrl}/api/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.content && !data.content.includes("error")) {
        return Response.json(data);
      }
    }
  } catch (e) {
    console.error("Agent error:", e);
  }

  // Fallback to Flowise if configured
  if (FLOWISE_API_KEY && FLOWISE_CHATFLOW_ID) {
    try {
      const res = await fetch(`https://cloud.flowiseai.com/api/v1/prediction/${FLOWISE_CHATFLOW_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${FLOWISE_API_KEY}`
        },
        body: JSON.stringify({
          question: lastMsg.content,
          overrideConfig: {}
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return Response.json({ role: "assistant", content: data.text || data.answer || data.response });
      }
    } catch (e) {
      console.error("Flowise error:", e);
    }
  }

  return Response.json({ 
    role: "assistant", 
    content: "Hey! I help companies slash B2B data costs. What are you working on?" 
  });
}
