import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { caption, style, platform } = await req.json();
    if (!caption?.trim()) return NextResponse.json({ error: "Caption required" }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });

    const prompt = `Rephrase this ${platform} caption in "${style}" style for T1 audiences (US, UK, CA, AU).
Add 3-5 relevant emojis. Keep it under 3 sentences.

Caption: "${caption}"

Return ONLY valid JSON, no markdown:
{"rephrased": "your rephrased caption here", "tip": "one sentence on why this works for T1"}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        }),
      }
    );

    const aiData = await response.json();
    const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    let cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const f = cleaned.indexOf("{"), l = cleaned.lastIndexOf("}");
    if (f !== -1 && l !== -1) cleaned = cleaned.slice(f, l + 1);
    return NextResponse.json(JSON.parse(cleaned));

  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
