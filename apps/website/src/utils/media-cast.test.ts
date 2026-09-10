import { describe, expect, it } from "vitest";
import { matchCastWorks, sameMediaId } from "./media-cast";

describe("matchCastWorks", () => {
  it("keeps every work when multiple voice actors share an actor", () => {
    const result = matchCastWorks(
      [{ id: 10 }],
      [
        { id: 1, actor_id: 10 },
        { id: 2, actor_id: 10 },
      ],
    );

    expect(result.matches[0]?.works.map((work) => work.id)).toEqual([1, 2]);
    expect(result.unmatchedWorks).toEqual([]);
  });

  it("returns works whose actor is absent from the media credits", () => {
    const result = matchCastWorks(
      [{ id: 10 }],
      [
        { id: 1, actor_id: 10 },
        { id: 2, actor_id: 99 },
        { id: 3, actor_id: null },
      ],
    );

    expect(result.unmatchedWorks.map((work) => work.id)).toEqual([2, 3]);
  });
});

describe("sameMediaId", () => {
  it("matches equivalent numeric IDs regardless of serialization", () => {
    expect(sameMediaId("123", 123)).toBe(true);
    expect(sameMediaId("123", 124)).toBe(false);
    expect(sameMediaId(null, 123)).toBe(false);
  });
});
