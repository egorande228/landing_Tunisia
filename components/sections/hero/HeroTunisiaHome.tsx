"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import SectionShell from "@/components/layout/SectionShell";
import Button from "@/components/ui/Button";
import { channels } from "@/lib/translations";
import type { HomeHeroContent } from "@/schemas/landing";
import { hoverLift, prepareReveal, pulseGlow, revealScale, revealUp, stopAnimation } from "@/motion/presets";
import { observeOnce, prefersReducedMotion } from "@/motion/observers";
import PlayerVisual from "../home/PlayerVisual";

type HeroProps = {
  content: HomeHeroContent;
  direction: "ltr" | "rtl";
};

function isExternalLink(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

function FeaturedHeroGameVisual({
  title,
  visual,
}: {
  title: string;
  visual: HomeHeroContent["stage"]["carousel"][number]["visual"];
}) {
  if (visual.kind === "image") {
    return (
      <Image
        src={visual.src}
        alt={visual.alt}
        fill
        sizes="(max-width: 719px) 100vw, (max-width: 1099px) 50vw, 33vw"
        className="home-hero__tile-image"
      />
    );
  }

  return (
    <PlayerVisual
      visual={{ ...visual, label: visual.label ?? title }}
      className="home-hero__tile-fallback"
      imageSizes="(max-width: 719px) 100vw, (max-width: 1099px) 50vw, 33vw"
    />
  );
}

export default function HeroTunisiaHome({ content, direction }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const featuredGames = content.stage.carousel.slice(0, 3);

  useEffect(() => {
    const section = sectionRef.current;
    const glow = glowRef.current;
    if (!section) return;

    const cardTargets = Array.from(section.querySelectorAll<HTMLElement>("[data-home-card]"));
    const copyTargets = Array.from(section.querySelectorAll<HTMLElement>("[data-home-copy]"));

    cardTargets.forEach((target) => prepareReveal(target, "scale"));
    copyTargets.forEach((target) => prepareReveal(target, "up"));

    const hoverCleanups = prefersReducedMotion() ? [] : cardTargets.map((target) => hoverLift(target));

    let glowAnimation: ReturnType<typeof pulseGlow> | null = null;

    const cleanup = observeOnce(section, () => {
      cardTargets.forEach((target, index) => revealScale(target, index * 90));
      copyTargets.forEach((target, index) => revealUp(target, 220 + index * 80));

      if (!prefersReducedMotion() && glow) {
        glowAnimation = pulseGlow(glow, 4200);
      }
    });

    return () => {
      hoverCleanups.forEach((teardown) => teardown());
      stopAnimation(glowAnimation);
      cleanup();
    };
  }, []);

  if (!featuredGames.length) {
    return null;
  }

  return (
    <SectionShell id="top" density="hero" className="overflow-hidden home-hero-section">
      <section ref={sectionRef} dir={direction}>
        <div className="home-hero">
          <span ref={glowRef} className="home-hero__glow" aria-hidden />

          <div className="home-hero__tiles">
            {featuredGames.map((item) => {
              const external = isExternalLink(item.href);

              return (
                <a
                  key={item.id}
                  data-home-card
                  href={item.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  className="home-hero__tile"
                >
                  <div className="home-hero__tile-media">
                    <FeaturedHeroGameVisual title={item.title} visual={item.visual} />
                  </div>

                  <div className="home-hero__tile-overlay">
                    {item.badge ? <span className="player-card-pill home-hero__tile-badge">{item.badge}</span> : null}
                    <p className="home-hero__tile-title">{item.title}</p>
                  </div>
                </a>
              );
            })}
          </div>

          <div className="home-hero__copy">
            {content.eyebrow ? (
              <div data-home-copy className="home-hero__eyebrow eyebrow text-[var(--color-primary-strong)]">
                {content.eyebrow}
              </div>
            ) : null}

            <h1 data-home-copy className="home-hero__title text-[var(--color-foreground)]">
              {content.title}
            </h1>

            <p data-home-copy className="home-hero__body">
              {content.body}
            </p>

            <div data-home-copy className="home-hero__actions">
              <Button href={content.primaryCta.href} size="md" external={isExternalLink(content.primaryCta.href)}>
                {content.primaryCta.label}
              </Button>
              {content.secondaryCta ? (
                <Button
                  href={content.secondaryCta.href}
                  intent="secondary"
                  size="md"
                  external={isExternalLink(content.secondaryCta.href)}
                >
                  {content.secondaryCta.label}
                </Button>
              ) : null}
            </div>
            {content.partnerContact ? (
              <div data-home-copy className="mx-auto mt-5 flex w-full max-w-[420px] flex-col items-center gap-3 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground-soft)]">
                  {content.partnerContact.eyebrow}
                </p>
                <div className="flex w-full flex-col justify-center gap-2 sm:flex-row">
                <a
                  href={channels.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[42px] flex-1 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] px-5 text-[14px] font-semibold text-[var(--color-foreground)] transition hover:-translate-y-0.5 hover:bg-white/[0.09]"
                >
                  {content.partnerContact.telegram}
                </a>
                <a
                  href={channels.email}
                  className="inline-flex min-h-[42px] flex-1 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] px-5 text-[14px] font-semibold text-[var(--color-foreground)] transition hover:-translate-y-0.5 hover:bg-white/[0.09]"
                >
                  {content.partnerContact.mail}
                </a>
              </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </SectionShell>
  );
}
