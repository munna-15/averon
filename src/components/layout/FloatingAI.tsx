"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowUp,
  CircleUserRound,
  Plus,
  Ruler,
  Shirt,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import gsap from "gsap";

type Message = {
  id: number;
  role: "assistant" | "user";
  content: string;
};

const SUGGESTIONS = [
  {
    icon: Shirt,
    title: "Find my style",
    description: "Discover pieces that suit me",
    prompt: "Help me find my personal style.",
  },
  {
    icon: ShoppingBag,
    title: "Build an outfit",
    description: "Create a complete look",
    prompt: "Help me build a complete outfit.",
  },
  {
    icon: Ruler,
    title: "Find my size",
    description: "Get the right fit",
    prompt: "Help me find the right size.",
  },
];

export function FloatingAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLElement>(null);

  const openAssistant = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Initialize animation once.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;

    if (!panel || !backdrop) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const content = panel.querySelectorAll("[data-ai-content]");

    gsap.set(backdrop, {
      autoAlpha: 0,
      pointerEvents: "none",
    });

    gsap.set(panel, {
      autoAlpha: 0,
      pointerEvents: "none",
      scale: reducedMotion ? 1 : 0.97,
      y: reducedMotion ? 0 : 12,
      transformOrigin: "bottom right",
    });

    gsap.set(content, {
      autoAlpha: 0,
      y: reducedMotion ? 0 : 8,
    });

    const timeline = gsap.timeline({
      paused: true,
      defaults: {
        ease: "power2.out",
      },
      onReverseComplete: () => {
        panel.style.pointerEvents = "none";
        backdrop.style.pointerEvents = "none";
      },
    });

    timeline
      .to(
        backdrop,
        {
          autoAlpha: 1,
          duration: reducedMotion ? 0.001 : 0.28,
        },
        0,
      )
      .to(
        panel,
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: reducedMotion ? 0.001 : 0.4,
          ease: "power3.out",
        },
        0,
      )
      .to(
        content,
        {
          autoAlpha: 1,
          y: 0,
          duration: reducedMotion ? 0.001 : 0.28,
          stagger: reducedMotion ? 0 : 0.04,
          ease: "power2.out",
        },
        reducedMotion ? 0 : 0.1,
      );

    timelineRef.current = timeline;

    return () => {
      timeline.kill();
      timelineRef.current = null;

      gsap.killTweensOf([panel, backdrop, content]);
    };
  }, []);

  // Control the same timeline for opening and closing.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const timeline = timelineRef.current;

    if (!panel || !backdrop || !timeline) return;

    if (isOpen) {
      panel.style.pointerEvents = "auto";
      backdrop.style.pointerEvents = "auto";
      timeline.play();
    } else {
      timeline.reverse();
    }
  }, [isOpen]);

  // Keep the scrollbar visible while locking background scrolling.
  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;
    const body = document.body;

    const scrollY = window.scrollY;

    const previousHtmlOverflowY = html.style.overflowY;
    const previousHtmlScrollBehavior = html.style.scrollBehavior;

    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyLeft = body.style.left;
    const previousBodyRight = body.style.right;
    const previousBodyWidth = body.style.width;
    const previousBodyOverflow = body.style.overflow;

    // Keep the scrollbar gutter reserved.
    html.style.overflowY = "scroll";
    html.style.scrollBehavior = "auto";

    // Freeze the page at its current position.
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAssistant();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      // Restore the original page styles.
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.left = previousBodyLeft;
      body.style.right = previousBodyRight;
      body.style.width = previousBodyWidth;
      body.style.overflow = previousBodyOverflow;

      html.style.overflowY = previousHtmlOverflowY;

      // Restore the exact scroll position without smooth scrolling.
      window.scrollTo(0, scrollY);

      html.style.scrollBehavior = previousHtmlScrollBehavior;
    };
  }, [isOpen, closeAssistant]);

  // Focus composer after opening.
  useEffect(() => {
    if (!isOpen) return;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 430);

    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  // Automatically resize textarea.
  useEffect(() => {
    const textarea = inputRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`;
  }, [input]);

  // Keep the latest message visible.
  useEffect(() => {
    const container = scrollAreaRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = input.trim();

    if (!value) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "user",
        content: value,
      },
    ]);

    setInput("");
  };

  const handleSuggestion = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        aria-hidden="true"
        onClick={closeAssistant}
        className="pointer-events-none invisible fixed inset-0 z-[89] bg-black/20 opacity-0 backdrop-blur-[3px]"
      />

      {/* Assistant panel */}
      <div className="pointer-events-none fixed inset-0 z-[90] flex items-end justify-end sm:items-end sm:p-7">
        <section
          ref={panelRef}
          aria-label="AVÉRON Personal Shopping Assistant"
          aria-hidden={!isOpen}
          className="pointer-events-none invisible relative flex h-[100dvh] w-full flex-col overflow-hidden border border-[#e9e5df] bg-[#fbfaf8] text-[#171717] opacity-0 shadow-[0_30px_100px_rgba(0,0,0,0.2)] sm:h-[min(690px,calc(100dvh-110px))] sm:w-[430px] sm:rounded-[24px]"
        >
          {/* Decorative backgrounds */}
          <div className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-[#eee9e1]/70 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 -left-24 size-64 rounded-full bg-[#f0ece5]/80 blur-3xl" />

          {/* Header */}
          <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-[#eae6df] bg-[#fbfaf8]/90 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3" data-ai-content>
              <div className="flex size-10 items-center justify-center rounded-full bg-[#171717] text-white shadow-sm">
                <Sparkles size={18} strokeWidth={1.5} />
              </div>

              <div>
                <p className="text-[12px] font-semibold tracking-[0.19em] text-[#242424]">
                  AVÉRON
                </p>

                <div className="mt-1 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-[#72927a]" />
                  <span className="text-[10px] tracking-[0.08em] text-[#88837b]">
                    PERSONAL SHOPPING ASSISTANT
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={closeAssistant}
              aria-label="Close assistant"
              className="relative z-20 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#e8e4dd] bg-white/70 text-[#66615b] transition-colors duration-200 hover:bg-[#efede8] hover:text-black"
            >
              <X size={17} strokeWidth={1.6} />
            </button>
          </header>

          {/* Conversation */}
          <main
            ref={scrollAreaRef}
            className="relative z-10 flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain touch-pan-y px-5 py-7 [scrollbar-color:#d8d3ca_transparent] [scrollbar-width:thin] sm:px-6"
          >
            <div className="mb-7" data-ai-content>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8e3dc] bg-white/70 px-3 py-1.5 text-[10px] font-medium tracking-[0.13em] text-[#777168]">
                <Sparkles size={12} />
                YOUR PERSONAL STYLE SPACE
              </span>

              <h2 className="max-w-[330px] font-serif text-[34px] leading-[1.12] tracking-[-0.045em] text-[#24221f] sm:text-[38px]">
                Style begins
                <br />
                with a{" "}
                <span className="italic text-[#898174]">conversation.</span>
              </h2>

              <p className="mt-3 max-w-[310px] text-[13px] leading-[1.8] text-[#827d74]">
                Tell us what you are looking for. We will help you find the
                pieces that feel right.
              </p>
            </div>

            {messages.length === 0 ? (
              <div className="space-y-3" data-ai-content>
                <p className="mb-3 text-[10px] font-semibold tracking-[0.17em] text-[#918b81]">
                  HOW CAN WE HELP YOU?
                </p>

                {SUGGESTIONS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => handleSuggestion(item.prompt)}
                      className="group flex w-full items-center gap-4 rounded-[15px] border border-[#ebe7e0] bg-white/80 px-4 py-4 text-left transition-all duration-300 hover:border-[#c9c2b7] hover:bg-white hover:shadow-[0_8px_25px_rgba(40,35,25,0.045)]"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f3f0eb] text-[#555047] transition-colors duration-300 group-hover:bg-[#eae5dc]">
                        <Icon size={17} strokeWidth={1.5} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-[#34312c]">
                          {item.title}
                        </span>

                        <span className="mt-1 block text-[11px] text-[#928c83]">
                          {item.description}
                        </span>
                      </span>

                      <Plus
                        size={16}
                        strokeWidth={1.5}
                        className="shrink-0 text-[#aaa49a] transition-transform duration-300 group-hover:rotate-90"
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-5" data-ai-content>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2.5 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#171717] text-white">
                        <Sparkles size={13} />
                      </span>
                    )}

                    <div
                      className={`max-w-[82%] whitespace-pre-wrap break-words rounded-[16px] px-4 py-3 text-[13px] leading-[1.7] ${
                        message.role === "user"
                          ? "rounded-br-[5px] bg-[#242321] text-white"
                          : "rounded-tl-[5px] border border-[#ebe7e0] bg-white text-[#48443e]"
                      }`}
                    >
                      {message.content}
                    </div>

                    {message.role === "user" && (
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#eeeae4] text-[#625d54]">
                        <CircleUserRound size={15} />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Composer */}
          <footer className="relative z-10 shrink-0 border-t border-[#eae6df] bg-[#fbfaf8]/95 px-4 pb-5 pt-4 sm:px-5 sm:pb-5">
            <form
              onSubmit={handleSend}
              className={`relative flex items-end gap-3 rounded-[17px] border bg-white px-4 py-3 transition-all duration-300 ${
                isFocused
                  ? "border-[#bdb5a9] shadow-[0_0_0_3px_rgba(150,140,125,0.07)]"
                  : "border-[#e9e5de]"
              }`}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={1}
                placeholder="Ask anything about your style..."
                aria-label="Message AVÉRON assistant"
                className="max-h-24 min-h-7 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-1 text-[13px] leading-6 text-[#34312c] outline-none placeholder:text-[#aaa49b]"
              />

              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#20201e] text-white transition-all duration-200 hover:bg-[#44413b] disabled:cursor-not-allowed disabled:bg-[#e8e5df] disabled:text-[#aaa49e]"
              >
                <ArrowUp size={16} strokeWidth={1.8} />
              </button>
            </form>

            <p className="mt-3 text-center text-[9px] tracking-[0.04em] text-[#aaa49b]">
              PERSONAL STYLE. THOUGHTFULLY CONSIDERED.
            </p>
          </footer>
        </section>
      </div>

      {/* Floating trigger */}
      <button
        type="button"
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={isOpen}
        onClick={isOpen ? closeAssistant : openAssistant}
        className={`fixed bottom-5 right-5 z-[91] flex size-[54px] items-center justify-center rounded-full bg-[#191919] text-white shadow-[0_5px_25px_rgba(0,0,0,0.19)] transition-all duration-300 hover:scale-[1.06] hover:bg-[#30302e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#777168] sm:bottom-7 sm:right-12 ${
          isOpen
            ? "pointer-events-none scale-90 opacity-0"
            : "pointer-events-auto"
        }`}
      >
        <Sparkles size={22} strokeWidth={1.45} />
      </button>
    </>
  );
}
