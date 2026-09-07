export type SearchCandidate = { id: string; title: string; score: number };

export function permissionSafeResults(candidates: SearchCandidate[], readablePageIds: ReadonlySet<string>, limit = 20) {
  return candidates.filter((candidate) => readablePageIds.has(candidate.id)).sort((a, b) => b.score - a.score).slice(0, limit);
}
