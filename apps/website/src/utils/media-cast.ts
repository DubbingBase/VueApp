export interface CastActorReference {
  id: number;
}

export interface CastWorkReference {
  id: number;
  actor_id: number | string | null;
}

export interface CastWorkMatchResult<
  Actor extends CastActorReference,
  Work extends CastWorkReference,
> {
  matches: Array<{ actor: Actor; works: Work[] }>;
  unmatchedWorks: Work[];
}

export function sameMediaId(
  left: number | string | null | undefined,
  right: number | string | null | undefined,
): boolean {
  return (
    left !== null &&
    left !== undefined &&
    right !== null &&
    right !== undefined &&
    String(left) === String(right)
  );
}

export function matchCastWorks<
  Actor extends CastActorReference,
  Work extends CastWorkReference,
>(actors: Actor[], works: Work[]): CastWorkMatchResult<Actor, Work> {
  const matchedWorkIds = new Set<number>();
  const matches = actors.map((actor) => {
    const actorWorks = works.filter((work) =>
      sameMediaId(work.actor_id, actor.id),
    );
    actorWorks.forEach((work) => matchedWorkIds.add(work.id));
    return { actor, works: actorWorks };
  });

  return {
    matches,
    unmatchedWorks: works.filter((work) => !matchedWorkIds.has(work.id)),
  };
}
