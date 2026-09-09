import { describe, expect, it } from "vitest";
import {
  buildDiscordEmbed,
  normalizeDiscordUrl,
} from "./discord";

describe("Discord admin notifications", () => {
  it("normalizes internal URLs once and preserves external URLs", () => {
    expect(normalizeDiscordUrl("/movie/42")).toBe(
      "https://dubbingbase.com/fr/movie/42",
    );
    expect(normalizeDiscordUrl("/fr/show/42")).toBe(
      "https://dubbingbase.com/fr/show/42",
    );
    expect(normalizeDiscordUrl("https://en.wikipedia.org/wiki/Example")).toBe(
      "https://en.wikipedia.org/wiki/Example",
    );
  });

  it.each([
    ["wiki_discovery", "Discovery"],
    ["wiki_check", "Check"],
    ["wiki_extract", "Extract"],
  ] as const)("identifies %s notifications", (queue, label) => {
    const embed = buildDiscordEmbed("Queue event", "Details", { queue });
    expect(embed.title).toBe(`[${label}] Queue event`);
    expect(embed.author).toEqual({ name: `DubbingBase • ${label}` });
    expect(embed.footer).toEqual({
      text: "DubbingBase Admin Notifications",
    });
  });

  it("uses a consistent neutral default and truncates descriptions", () => {
    const embed = buildDiscordEmbed("Event", "x".repeat(2100));
    expect(embed.color).toBe(0x2a2a2a);
    expect(String(embed.description)).toHaveLength(2000);
    expect(String(embed.description)).toContain("(truncated)");
  });
});
