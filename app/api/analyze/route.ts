import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("[analyze] Request received");

  try {
    const body = await req.json();
    const url = body?.url;

    if (!url || !url.trim()) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("[analyze] Gemini key present:", !!apiKey);

    if (!apiKey) {
      return NextResponse.json({
        error: "GEMINI_API_KEY is not set. Add it in Vercel → Settings → Environment Variables, then redeploy."
      }, { status: 500 });
    }

    let platform = "Unknown";
    if (url.includes("instagram.com")) platform = "Instagram";
    else if (url.includes("tiktok.com")) platform = "TikTok";
    else if (url.includes("facebook.com") || url.includes("fb.com")) platform = "Facebook";
    else if (url.includes("youtube.com") || url.includes("youtu.be")) platform = "YouTube";

    const prompt = `You are a T1 social media content strategist (US, UK, Canada, Australia markets).
Analyze this ${platform} URL: ${url}

Return ONLY a valid JSON object, no markdown, no backticks, no extra text. Start with { and end with }.

{"platform":"${platform}","contentType":"Reel","niche":"specific topic inferred from URL","originalCaption":"realistic sample caption for this content type","analysis":{"tone":"energetic","targetAudience":"T1 millennials 25-34","engagementPotential":"High","strengths":["specific strength 1","specific strength 2","specific strength 3"],"weaknesses":["specific weakness 1","specific weakness 2"]},"rephrasedCaptions":[{"style":"Authoritative","caption":"punchy authoritative caption for T1 audiences","emoji":"🎯"},{"style":"Conversational","caption":"friendly relatable caption for T1","emoji":"💬"},{"style":"Story-Driven","caption":"narrative hook caption for T1","emoji":"📖"}],"screenTextHooks":["Bold hook under 6 words","Question that stops scroll?","Surprising stat or claim"],"title":"SEO-optimized title under 60 chars","description":"Optimized 80-word description for T1 audiences with keywords and soft CTA.","seoTags":["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10","tag11","tag12","tag13","tag14","tag15"],"ctas":[{"type":"Soft CTA","text":"low friction discovery CTA","placement":"End of caption"},{"type":"Direct CTA","text":"direct action CTA for T1 buyers","placement":"First comment"},{"type":"Engagement CTA","text":"comment boosting CTA","placement":"Mid-caption"}]}`;

    console.log("[analyze] Calling Gemini API...");

    const response = await fetch(
     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    console.log("[analyze] Gemini response status:", response.status);

    if (!response.ok) {
      const errText = await response.text();
      console.log("[analyze] Gemini error:", errText);
      let detail = errText;
      try { detail = JSON.parse(errText)?.error?.message || errText; } catch {}
      return NextResponse.json({ error: `Gemini API error: ${detail}` }, { status: 500 });
    }

    const aiData = await response.json();
    const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log("[analyze] Raw response length:", rawText.length);

    if (!rawText) {
      return NextResponse.json({ error: "Empty response from Gemini" }, { status: 500 });
    }

    let cleaned = rawText.trim();
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const f = cleaned.indexOf("{");
    const l = cleaned.lastIndexOf("}");
    if (f === -1 || l === -1) {
      return NextResponse.json({ error: "AI returned invalid JSON. Try again." }, { status: 500 });
    }
    cleaned = cleaned.slice(f, l + 1);
    const parsed = JSON.parse(cleaned);
    console.log("[analyze] Success!");
    return NextResponse.json(parsed);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log("[analyze] ERROR:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
