"use client";
import { useState } from "react";

interface Caption { style: string; caption: string; emoji: string; }
interface CTA { type: string; text: string; placement: string; }
interface Analysis {
  tone: string; targetAudience: string; engagementPotential: string;
  strengths: string[]; weaknesses: string[];
}
interface Result {
  platform: string; contentType: string; niche: string; originalCaption: string;
  analysis: Analysis;
  rephrasedCaptions: Caption[];
  screenTextHooks: string[];
  title: string; description: string;
  seoTags: string[];
  ctas: CTA[];
}

const PLATFORM_ICONS: Record<string, string> = {
  Instagram: "📸", TikTok: "🎵", Facebook: "👥", YouTube: "▶️", Unknown: "🔗",
};

const REPHRASE_STYLES = ["Authoritative", "Conversational", "Story-Driven", "Viral Hook", "Luxury"];

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState("captions");
  const [customCaption, setCustomCaption] = useState("");
  const [rephrasing, setRephrasing] = useState("");
  const [rephrased, setRephrased] = useState<Record<string, { text: string; tip: string }>>({});

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const copy = (text: string, label = "Copied!") => {
    navigator.clipboard.writeText(text).then(() => showToast(label));
  };

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(""); setResult(null); setRephrased({});
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Analysis failed");
      setResult(data);
      setCustomCaption(data.originalCaption || "");
      setActiveTab("captions");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const rephrase = async (style: string) => {
    if (!customCaption.trim() || !result) return;
    setRephrasing(style);
    try {
      const res = await fetch("/api/rephrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: customCaption, style, platform: result.platform }),
      });
      const data = await res.json();
      if (data.rephrased) setRephrased(prev => ({ ...prev, [style]: { text: data.rephrased, tip: data.tip || "" } }));
    } catch { /* silent */ }
    finally { setRephrasing(""); }
  };

  const engColor = (v: string) => v === "High" ? "#00ff88" : v === "Medium" ? "#ffee00" : "#ff6464";

  const platformClass = (p: string) => `platform-${p.toLowerCase()}`;

  const TABS = [
    { id: "captions", label: "💬 Captions" },
    { id: "hooks", label: "🎯 Hooks & Title" },
    { id: "seo", label: "🔍 SEO Tags" },
    { id: "cta", label: "📣 CTAs" },
  ];

  return (
    <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", paddingBottom: 80 }}>

      {/* HEADER */}
      <header style={{
        borderBottom: "1px solid rgba(0,245,255,0.1)", padding: "18px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(5,5,16,0.9)", backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #00f5ff, #b400ff)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }}>⚡</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
              <span className="neon-cyan">NEON</span><span style={{ color: "#e0e8ff" }}>REACH</span>
            </div>
            <div style={{ fontSize: "0.6rem", color: "#6b7ab8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              T1 Content Analyzer
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 10px #00ff88", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "0.68rem", color: "#6b7ab8", letterSpacing: "0.08em" }}>AI POWERED</span>
        </div>
      </header>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "36px 20px" }}>

        {/* HERO — only before results */}
        {!result && !loading && (
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b7ab8", marginBottom: 14 }}>
              ◆ SOCIAL MEDIA INTELLIGENCE ◆
            </div>
            <h1 style={{ fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 14 }}>
              <span className="neon-cyan">Analyze</span> any content.<br />
              <span className="neon-pink">Dominate</span> T1 markets.
            </h1>
            <p style={{ color: "#6b7ab8", fontSize: "0.95rem", maxWidth: 480, margin: "0 auto 28px" }}>
              Paste any Instagram, TikTok, Facebook, or YouTube link and get AI-powered captions, hooks, SEO tags, and CTAs built for US, UK, CA & AU audiences.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              {["📸 Instagram", "🎵 TikTok", "👥 Facebook", "▶️ YouTube"].map(p => (
                <span key={p} style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.15)", padding: "6px 14px", borderRadius: 20, fontSize: "0.78rem", color: "#8899cc" }}>{p}</span>
              ))}
            </div>
          </div>
        )}

        {/* URL INPUT */}
        <div className="card" style={{ padding: 22, marginBottom: 28 }}>
          <div className="section-label">🔗 Paste Content URL</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              className="input-neon"
              type="url"
              placeholder="https://www.instagram.com/reel/... or TikTok, YouTube, Facebook"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && analyze()}
              style={{ padding: "13px 16px" }}
            />
            <button
              className="btn-neon"
              onClick={analyze}
              disabled={loading || !url.trim()}
              style={{ padding: "13px 26px", whiteSpace: "nowrap", minWidth: 130 }}
            >
              {loading
                ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="spinner" /> Analyzing</span>
                : "⚡ Analyze"}
            </button>
          </div>
          {loading && <div className="loading-bar" style={{ marginTop: 12 }} />}
          {error && (
            <div style={{ marginTop: 12, padding: "10px 16px", background: "rgba(255,64,64,0.1)", border: "1px solid rgba(255,64,64,0.3)", borderRadius: 8, color: "#ff8080", fontSize: "0.84rem" }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {/* RESULTS */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            {/* Overview card */}
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                    <span className={platformClass(result.platform)}>
                      {PLATFORM_ICONS[result.platform] || "🔗"} {result.platform}
                    </span>
                    <span style={{ background: "rgba(255,238,0,0.1)", border: "1px solid rgba(255,238,0,0.3)", color: "#ffee00", borderRadius: 20, padding: "4px 12px", fontSize: "0.7rem", fontWeight: 700 }}>
                      {result.contentType}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 4 }}>{result.niche}</div>
                  <div style={{ fontSize: "0.82rem", color: "#6b7ab8" }}>
                    Audience: <span style={{ color: "#e0e8ff" }}>{result.analysis.targetAudience}</span>
                    {" · "}Tone: <span style={{ color: "#e0e8ff" }}>{result.analysis.tone}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="section-label">Engagement</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 900, color: engColor(result.analysis.engagementPotential), textShadow: `0 0 12px ${engColor(result.analysis.engagementPotential)}` }}>
                    {result.analysis.engagementPotential}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
                <div>
                  <div className="section-label">💚 Strengths</div>
                  {(result.analysis.strengths || []).map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: "0.83rem" }}>
                      <span style={{ color: "#00ff88", flexShrink: 0 }}>✓</span>
                      <span style={{ color: "#aab8d8" }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="section-label">⚠ Weaknesses</div>
                  {(result.analysis.weaknesses || []).map((w, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: "0.83rem" }}>
                      <span style={{ color: "#ff6464", flexShrink: 0 }}>✗</span>
                      <span style={{ color: "#aab8d8" }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", gap: 2, borderBottom: "1px solid rgba(0,245,255,0.1)" }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  padding: "10px 16px", background: activeTab === tab.id ? "rgba(0,245,255,0.08)" : "transparent",
                  border: "none", borderBottom: activeTab === tab.id ? "2px solid #00f5ff" : "2px solid transparent",
                  color: activeTab === tab.id ? "#00f5ff" : "#6b7ab8",
                  cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, transition: "all 0.2s",
                  borderRadius: "8px 8px 0 0", marginBottom: -1,
                }}>{tab.label}</button>
              ))}
            </div>

            {/* TAB: CAPTIONS */}
            {activeTab === "captions" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Editable caption + rephrase */}
                <div className="card" style={{ padding: 20 }}>
                  <div className="section-label">✏ Edit Caption — Then Rephrase</div>
                  <textarea
                    className="input-neon"
                    rows={3}
                    value={customCaption}
                    onChange={e => setCustomCaption(e.target.value)}
                    style={{ padding: "12px 14px", marginBottom: 12 }}
                    placeholder="Edit the caption or paste your own, then click a style below..."
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {REPHRASE_STYLES.map(style => (
                      <button key={style} className="btn-ghost" onClick={() => rephrase(style)}
                        disabled={!!rephrasing || !customCaption.trim()}
                        style={{ padding: "8px 14px" }}>
                        {rephrasing === style
                          ? <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="spinner" style={{ width: 12, height: 12 }} />Rephrasing…</span>
                          : `↺ ${style}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rephrased results */}
                {Object.entries(rephrased).map(([style, r]) => (
                  <div key={style} className="caption-card" style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ff69d9" }}>{style}</span>
                      <button className="btn-ghost" onClick={() => copy(r.text)} style={{ padding: "4px 12px" }}>Copy</button>
                    </div>
                    <p style={{ color: "#e0e8ff", lineHeight: 1.7, fontSize: "0.9rem", marginBottom: r.tip ? 8 : 0 }}>{r.text}</p>
                    {r.tip && <p style={{ color: "#6b7ab8", fontSize: "0.75rem", fontStyle: "italic" }}>💡 {r.tip}</p>}
                  </div>
                ))}

                {/* AI-generated captions */}
                <div>
                  <div className="section-label" style={{ marginBottom: 10 }}>AI-Generated Caption Variants</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(result.rephrasedCaptions || []).map((cap, i) => (
                      <div key={i} className="caption-card" style={{ padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ff69d9" }}>
                            {cap.emoji} {cap.style}
                          </span>
                          <button className="btn-ghost" onClick={() => copy(cap.caption)} style={{ padding: "4px 12px" }}>Copy</button>
                        </div>
                        <p style={{ color: "#e0e8ff", lineHeight: 1.7, fontSize: "0.9rem" }}>{cap.caption}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: HOOKS & TITLE */}
            {activeTab === "hooks" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="card" style={{ padding: 22 }}>
                  <div className="section-label" style={{ marginBottom: 14 }}>🎯 Screen Text Hooks</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(result.screenTextHooks || []).map((hook, i) => (
                      <div key={i} className="hook-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, color: "#00ff88", fontSize: "1rem" }}>{hook}</span>
                        <button className="btn-ghost" onClick={() => copy(hook)} style={{ padding: "4px 12px", marginLeft: 12, flexShrink: 0 }}>Copy</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: 22 }}>
                  <div className="section-label">Optimized Title</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <p style={{ fontWeight: 700, fontSize: "1rem", color: "#e0e8ff", flex: 1 }}>{result.title}</p>
                    <button className="btn-ghost" onClick={() => copy(result.title)} style={{ padding: "8px 14px", flexShrink: 0 }}>Copy</button>
                  </div>
                </div>

                <div className="card" style={{ padding: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div className="section-label" style={{ margin: 0 }}>Optimized Description</div>
                    <button className="btn-ghost" onClick={() => copy(result.description)} style={{ padding: "6px 14px" }}>Copy</button>
                  </div>
                  <p style={{ color: "#aab8d8", lineHeight: 1.8, fontSize: "0.88rem" }}>{result.description}</p>
                </div>
              </div>
            )}

            {/* TAB: SEO */}
            {activeTab === "seo" && (
              <div className="card" style={{ padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <div className="section-label">🔍 SEO Tags & Hashtags</div>
                    <div style={{ fontSize: "0.78rem", color: "#6b7ab8" }}>{(result.seoTags || []).length} tags — optimized for T1 discovery</div>
                  </div>
                  <button className="btn-neon"
                    onClick={() => copy((result.seoTags || []).map(t => `#${t.replace(/^#/, "")}`).join(" "), "All tags copied!")}
                    style={{ padding: "10px 18px" }}>
                    Copy All
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {(result.seoTags || []).map((tag, i) => (
                    <span key={i} className="tag" onClick={() => copy(`#${tag.replace(/^#/, "")}`)} title="Click to copy">
                      #{tag.replace(/^#/, "")}
                    </span>
                  ))}
                </div>
                <div style={{ padding: 14, background: "rgba(0,245,255,0.03)", borderRadius: 8, border: "1px dashed rgba(0,245,255,0.15)" }}>
                  <div className="section-label">Copy-Ready Block</div>
                  <p style={{ color: "#6b7ab8", fontSize: "0.78rem", lineHeight: 1.9, wordBreak: "break-word" }}>
                    {(result.seoTags || []).map(t => `#${t.replace(/^#/, "")}`).join(" ")}
                  </p>
                </div>
              </div>
            )}

            {/* TAB: CTAs */}
            {activeTab === "cta" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="section-label">📣 Call-to-Actions — Built for T1 Conversion</div>
                {(result.ctas || []).map((cta, i) => (
                  <div key={i} className="cta-card" style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b400ff" }}>{cta.type}</span>
                        <div style={{ fontSize: "0.7rem", color: "#6b7ab8", marginTop: 2 }}>📍 {cta.placement}</div>
                      </div>
                      <button className="btn-ghost" onClick={() => copy(cta.text)} style={{ padding: "4px 12px" }}>Copy</button>
                    </div>
                    <p style={{ color: "#e0e8ff", fontWeight: 600, fontSize: "0.92rem", lineHeight: 1.6 }}>{cta.text}</p>
                  </div>
                ))}

                <button className="btn-neon" style={{ padding: 16, width: "100%", fontSize: "0.88rem", marginTop: 8 }}
                  onClick={() => {
                    const pkg = [
                      `===== NEONREACH CONTENT PACKAGE =====`,
                      `Platform: ${result.platform} | Type: ${result.contentType} | Niche: ${result.niche}`,
                      ``,
                      `📝 TITLE:\n${result.title}`,
                      ``,
                      `📄 DESCRIPTION:\n${result.description}`,
                      ``,
                      `🎯 SCREEN TEXT HOOKS:\n${(result.screenTextHooks || []).join("\n")}`,
                      ``,
                      `💬 CAPTIONS:\n${(result.rephrasedCaptions || []).map(c => `[${c.style}]\n${c.caption}`).join("\n\n")}`,
                      ``,
                      `🔍 SEO TAGS:\n${(result.seoTags || []).map(t => `#${t.replace(/^#/, "")}`).join(" ")}`,
                      ``,
                      `📣 CTAs:\n${(result.ctas || []).map(c => `[${c.type}] ${c.text}\nPlacement: ${c.placement}`).join("\n\n")}`,
                    ].join("\n");
                    copy(pkg, "✅ Full package copied!");
                  }}>
                  ⬇ Copy Complete Content Package
                </button>
              </div>
            )}

            <div style={{ textAlign: "center" }}>
              <button className="btn-ghost" onClick={() => { setResult(null); setUrl(""); setError(""); setRephrased({}); }} style={{ padding: "10px 22px" }}>
                ← Analyze Another URL
              </button>
            </div>
          </div>
        )}

        {/* FEATURE CARDS — empty state */}
        {!result && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginTop: 8 }}>
            {[
              { icon: "💬", title: "Smart Captions", desc: "3 tone variants + 5 custom rephrase styles on demand" },
              { icon: "🎯", title: "Scroll-Stop Hooks", desc: "Screen text that grabs T1 audiences in under 2 seconds" },
              { icon: "🔍", title: "SEO Tags", desc: "15 high-traction tags ranked for US/UK/CA/AU markets" },
              { icon: "📣", title: "T1 CTAs", desc: "Soft, direct, and engagement CTAs for T1 buyer intent" },
            ].map((f, i) => (
              <div key={i} className="card" style={{ padding: 18 }}>
                <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: "0.88rem" }}>{f.title}</div>
                <div style={{ color: "#6b7ab8", fontSize: "0.78rem", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <div className="copy-toast">✅ {toast}</div>}
    </main>
  );
}
