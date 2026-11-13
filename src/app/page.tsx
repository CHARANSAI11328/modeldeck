"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DeckIcon, DeckLogo } from "@/components/ui/DeckIcon";
import { ProviderMark } from "@/components/ui/ProviderMark";
import type { ProviderId } from "@/lib/types";

const providers: { id: ProviderId; name: string }[] = [
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "gemini", name: "Google Gemini" },
  { id: "deepseek", name: "DeepSeek" },
  { id: "groq", name: "Groq" },
  { id: "openrouter", name: "OpenRouter" },
];
const previews = [
  {
    label: "Explore an idea",
    prompt: "Help me turn an idea into something real.",
    title: "Let’s give your idea a little structure.",
    body: "Start with the person you’re helping. What is the one thing you could make easier for them?",
    steps: [
      "Define the problem in one sentence",
      "Sketch the smallest useful version",
      "Choose one thing to test this week",
    ],
  },
  {
    label: "Write better code",
    prompt: "How should I approach a new API?",
    title: "Build around a clear contract.",
    body: "A small, predictable interface is easier to test and maintain. Start with the behavior your client needs.",
    steps: [
      "Describe the request and response",
      "Validate inputs at the boundary",
      "Test success and failure cases",
    ],
  },
  {
    label: "Find the right words",
    prompt: "Help me write a thoughtful project update.",
    title: "Keep it clear, useful, and human.",
    body: "Give your reader the context they need, then make the next step easy to understand.",
    steps: [
      "Lead with what changed",
      "Explain why it matters",
      "Close with the next step",
    ],
  },
];
function CTA({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`deck-cta ${secondary ? "deck-cta-secondary" : ""}`}
    >
      {children}
      <span className="cta-island">
        <DeckIcon name="arrow" />
      </span>
    </Link>
  );
}
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    root.current
      ?.querySelectorAll("[data-reveal]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
      if (e.key === "Tab") {
        const links =
          root.current?.querySelectorAll<HTMLAnchorElement>(
            ".deck-mobile-nav a",
          );
        const last = links?.[links.length - 1];
        if (e.shiftKey && document.activeElement === menuButton.current) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          menuButton.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = before;
      window.removeEventListener("keydown", close);
    };
  }, [menuOpen]);
  const demo = previews[preview];
  return (
    <div className="deck-home" ref={root}>
      <a className="deck-skip" href="#main">
        Skip to content
      </a>
      <div className="deck-grain" aria-hidden="true" />
      <header className="deck-nav">
        <Link href="/" className="deck-brand">
          <DeckLogo />
          modeldeck<span>.</span>
        </Link>
        <nav aria-label="Main navigation" className="deck-nav-links">
          <a href="#workspace">Workspace</a>
          <a href="#models">Models</a>
          <a href="#studio">Assistant Studio</a>
        </nav>
        <div className="deck-nav-actions">
          <CTA href="/playground">Open playground</CTA>
          <button
            ref={menuButton}
            className={`deck-menu-toggle ${menuOpen ? "is-open" : ""}`}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="deck-mobile-nav"
          aria-label="Mobile navigation"
        >
          {[
            ["Workspace", "#workspace"],
            ["Models", "#models"],
            ["Assistant Studio", "#studio"],
            ["Open playground", "/playground"],
          ].map(([label, href], i) => (
            <Link
              style={{ animationDelay: `${i * 70}ms` }}
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
            >
              {label}
              <DeckIcon name="arrow" />
            </Link>
          ))}
        </nav>
      )}
      <main id="main">
        <section className="deck-hero deck-wrap">
          <div className="deck-hero-copy" data-reveal>
            <span className="deck-eyebrow">
              <span className="deck-dot" /> YOUR MODELS. YOUR SPACE.
            </span>
            <h1>
              A little more
              <br />
              possibility.
              <br />
              <span>A lot less friction.</span>
            </h1>
            <p>
              Your favorite AI models, together in one thoughtful workspace.
              Bring your keys, follow your curiosity, and make something worth
              making.
            </p>
            <div className="deck-actions">
              <CTA href="/playground">Start a conversation</CTA>
              <a href="#workspace" className="deck-text-link">
                Take a closer look <DeckIcon name="arrow" />
              </a>
            </div>
            <div className="deck-hero-note">
              <DeckIcon name="key" />
              <span>Your API keys. Your choice of model.</span>
            </div>
          </div>
          <div className="deck-preview-area" data-reveal>
            <div className="deck-preview-orbit" aria-hidden="true" />
            <div className="deck-bezel deck-preview">
              <div className="deck-core">
                <div className="deck-preview-top">
                  <span>
                    <DeckLogo /> Playground
                  </span>
                  <span className="deck-example">INTERACTIVE PREVIEW</span>
                </div>
                <div className="deck-preview-model">
                  <ProviderMark providerId="anthropic" className="h-5 w-5" />
                  <span>
                    Claude <small>Creative thinking partner</small>
                  </span>
                  <span className="deck-model-dot" />
                </div>
                <div className="deck-preview-chat" key={preview}>
                  <div className="deck-demo-user">{demo.prompt}</div>
                  <div className="deck-demo-reply">
                    <span className="deck-mini-label">
                      MODELDECK / EXAMPLE RESPONSE
                    </span>
                    <h3>{demo.title}</h3>
                    <p>{demo.body}</p>
                    <ol>
                      {demo.steps.map((step) => (
                        <li key={step}>
                          <DeckIcon name="check" />
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
                <div className="deck-preview-tabs" aria-label="Try an example">
                  {previews.map((item, i) => (
                    <button
                      key={item.label}
                      aria-pressed={preview === i}
                      onClick={() => setPreview(i)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <Link href="/playground" className="deck-demo-compose">
                  <span>Where will your next idea take you?</span>
                  <span className="cta-island">
                    <DeckIcon name="up" />
                  </span>
                </Link>
              </div>
            </div>
            <div className="deck-preview-caption">
              <span className="deck-dot" /> One workspace. A world of
              perspectives.
            </div>
          </div>
        </section>
        <section className="deck-providers deck-wrap" id="models" data-reveal>
          <p>GOOD COMPANY FOR YOUR NEXT BIG IDEA</p>
          <div>
            {providers.map((provider) => (
              <span key={provider.id}>
                <ProviderMark providerId={provider.id} className="h-6 w-6" />
                {provider.name}
              </span>
            ))}
          </div>
          <span className="deck-provider-footnote">
            And more, including your local models.
          </span>
        </section>
        <section className="deck-section deck-wrap" id="workspace">
          <div className="deck-section-heading" data-reveal>
            <div>
              <span className="deck-eyebrow">01 / ROOM TO THINK</span>
              <h2>
                Less in your way.
                <br />
                <span>More at your fingertips.</span>
              </h2>
            </div>
            <p>
              From your first question to your next breakthrough. The essentials
              are right where you need them.
            </p>
          </div>
          <div className="deck-feature-grid">
            <article className="deck-bezel deck-feature-large" data-reveal>
              <div className="deck-core deck-feature">
                <span className="deck-feature-icon">
                  <DeckIcon name="layers" />
                </span>
                <h3>
                  A fresh perspective,
                  <br />
                  one switch away.
                </h3>
                <p>
                  Explore different models without learning a new interface.
                  Search by provider or find a model for coding, reasoning, and
                  quick answers.
                </p>
                <div className="deck-model-list">
                  {providers.slice(0, 3).map((p, i) => (
                    <Link href="/playground" key={p.id}>
                      <ProviderMark providerId={p.id} className="h-6 w-6" />
                      <span>
                        {p.name}
                        <small>
                          {
                            [
                              "Explore, write, and build",
                              "Think through the details",
                              "Connect the bigger picture",
                            ][i]
                          }
                        </small>
                      </span>
                      <DeckIcon name="arrow" />
                    </Link>
                  ))}
                </div>
              </div>
            </article>
            <article className="deck-bezel" data-reveal>
              <div className="deck-core deck-feature">
                <span className="deck-feature-icon sage">
                  <DeckIcon name="key" />
                </span>
                <h3>
                  Bring your own keys.
                  <br />
                  Keep your own rhythm.
                </h3>
                <p>
                  Connect the providers you use in one key vault. Switch models
                  when you need a different point of view.
                </p>
                <div className="deck-key-visual">
                  <DeckIcon name="shield" />
                  <span>•••• &nbsp; •••• &nbsp; •••• &nbsp; ••••</span>
                  <DeckIcon name="check" />
                </div>
              </div>
            </article>
            <article className="deck-bezel" data-reveal>
              <div className="deck-core deck-feature">
                <span className="deck-feature-icon lavender">
                  <DeckIcon name="chat" />
                </span>
                <h3>Stay in the flow.</h3>
                <p>
                  Organized conversations, readable responses, adjustable model
                  settings, and Markdown exports. Your thinking, with room to
                  grow.
                </p>
                <div className="deck-mini-stats">
                  <span>
                    Stream<small>Answers as they arrive</small>
                  </span>
                  <span>
                    Fine-tune<small>Make each model yours</small>
                  </span>
                </div>
              </div>
            </article>
          </div>
        </section>
        <section className="deck-section deck-studio deck-wrap" id="studio">
          <div data-reveal>
            <span className="deck-eyebrow">02 / SOMETHING OF YOUR OWN</span>
            <h2>
              Your work.
              <br />
              Your voice.
              <br />
              <span>Your AI assistant.</span>
            </h2>
            <p>
              Turn your website and project knowledge into an assistant people
              can talk to. Shape its personality, preview the conversation, and
              add it to your site.
            </p>
            <CTA href="/studio" secondary>
              Explore Assistant Studio
            </CTA>
          </div>
          <div className="deck-bezel deck-studio-demo" data-reveal>
            <div className="deck-core">
              <div className="deck-studio-demo-head">
                <span className="deck-feature-icon">
                  <DeckIcon name="spark" />
                </span>
                <div>
                  Your assistant
                  <small>A welcoming extension of your website</small>
                </div>
                <span className="deck-example">PREVIEW</span>
              </div>
              <div className="deck-studio-greeting">
                <DeckIcon name="spark" />
                <h3>
                  A good conversation
                  <br />
                  starts with a hello.
                </h3>
                <p>
                  Hi there. I can help you explore the work,
                  <br />
                  the ideas, and the person behind them.
                </p>
                <Link href="/studio">
                  What have you been working on?
                  <DeckIcon name="arrow" />
                </Link>
                <Link href="/studio">
                  Tell me about your experience
                  <DeckIcon name="arrow" />
                </Link>
              </div>
              <div className="deck-studio-demo-foot">
                <span className="deck-dot" /> Made yours in Assistant Studio
              </div>
            </div>
          </div>
        </section>
        <section className="deck-section deck-wrap deck-start" data-reveal>
          <span className="deck-eyebrow">A SIMPLE START</span>
          <h2>From curious to creating.</h2>
          <div className="deck-steps">
            {[
              [
                "01",
                "Choose a model",
                "Find a familiar favorite or try a fresh perspective.",
              ],
              [
                "02",
                "Connect your key",
                "Add your provider’s API key in the key vault.",
              ],
              [
                "03",
                "Make it a conversation",
                "Ask, explore, refine. Pick up where you left off.",
              ],
            ].map(([n, title, text]) => (
              <div key={n}>
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <CTA href="/playground">Find your next idea</CTA>
        </section>
        <section className="deck-faq deck-wrap" data-reveal>
          <h2>A few things to know.</h2>
          <div>
            {[
              [
                "Do I need an API key?",
                "Yes. Connect your own key for a supported provider. Local OpenAI-compatible models can also be configured in the playground settings.",
              ],
              [
                "Can I switch between models?",
                "Yes. Use the model selector in the playground to search providers and models, or filter for coding, reasoning, and speed.",
              ],
              [
                "Is Assistant Studio part of ModelDeck?",
                "Yes. Build a website assistant from your content, customize its appearance, and prepare an embed or a GitHub pull request.",
              ],
              [
                "Who handles model usage charges?",
                "Your model provider handles API usage and billing on your account. ModelDeck uses the credentials you connect.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <DeckIcon name="plus" />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className="deck-footer deck-wrap">
        <Link href="/" className="deck-brand">
          <DeckLogo />
          modeldeck<span>.</span>
        </Link>
        <span>A little space for your next big idea.</span>
        <div>
          <Link href="/playground">Playground</Link>
          <Link href="/studio">Assistant Studio</Link>
          <a href="#main">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}
