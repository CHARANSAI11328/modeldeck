"use client";
import { DeckIcon, DeckLogo } from "@/components/ui/DeckIcon";
import { ProviderMark } from "@/components/ui/ProviderMark";
import { getProvider, getModel } from "@/lib/providers";
import { usePlaygroundStore } from "@/lib/store";
import type { ProviderId } from "@/lib/types";

export const PROMPT_EVENT = "modeldeck:prompt";
const suggestions = [
  {
    icon: "code" as const,
    tone: "ember",
    title: "Build something",
    detail: "Turn a challenge into working code",
    prompt: "Help me build a TypeScript function that ",
  },
  {
    icon: "spark" as const,
    tone: "lavender",
    title: "Explore an idea",
    detail: "Find a fresh way to think about it",
    prompt: "Help me brainstorm a few thoughtful approaches to ",
  },
  {
    icon: "book" as const,
    tone: "sage",
    title: "Make it clearer",
    detail: "Simplify something complicated",
    prompt: "Explain this in simple terms, with a practical example: ",
  },
  {
    icon: "chat" as const,
    tone: "sand",
    title: "Find the words",
    detail: "Give your next draft a better start",
    prompt: "Help me write a clear, thoughtful draft of ",
  },
];
export function EmptyChatState({
  providerId,
  modelId,
}: {
  providerId: ProviderId;
  modelId: string;
}) {
  const { keyStatusMap, setKeyVaultOpen, setApiDirectoryOpen } =
    usePlaygroundStore();
  const provider = getProvider(providerId);
  const model = getModel(providerId, modelId);
  const hasKey =
    keyStatusMap[providerId] || providerId === "custom-openai-compatible";
  return (
    <section className="deck-welcome" aria-label="Start a conversation">
      <div className="deck-welcome-symbol">
        <DeckLogo />
      </div>
      <span className="deck-mini-label">A LITTLE SPACE FOR BIG IDEAS</span>
      <h1>What’s on your mind?</h1>
      <p>
        Start with a question, a rough idea, or a blank page.
        <br className="hidden sm:block" /> Let’s see where it takes you.
      </p>
      <div className="deck-selected-model">
        <ProviderMark
          providerId={providerId}
          modelId={modelId}
          className="h-4 w-4"
        />
        <span>{model.name}</span>
        <span className={hasKey ? "deck-ready" : "deck-needs-key"}>
          {hasKey ? "Connected" : "Key needed"}
        </span>
      </div>
      <div className="deck-suggestions">
        {suggestions.map((item) => (
          <button
            className="deck-bezel"
            key={item.title}
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent(PROMPT_EVENT, { detail: item.prompt }),
              )
            }
          >
            <span className="deck-core">
              <span className={`deck-feature-icon ${item.tone}`}>
                <DeckIcon name={item.icon} />
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </span>
              <DeckIcon name="arrow" />
            </span>
          </button>
        ))}
      </div>
      {!hasKey && (
        <div className="deck-onboarding">
          <span className="deck-setup-icon">
            <DeckIcon name="key" />
          </span>
          <div>
            <strong>One small step before you start</strong>
            <p>
              Connect your {provider.shortLabel} key to send your first message.
            </p>
            <button
              className="deck-inline-link"
              onClick={() => setApiDirectoryOpen(true)}
            >
              Need an API key?
            </button>
          </div>
          <button
            className="deck-connect"
            onClick={() => setKeyVaultOpen(true, providerId)}
          >
            Connect key
            <span className="cta-island">
              <DeckIcon name="arrow" />
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
