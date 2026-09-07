# Knowledge copilot and permission-safe RAG

Atlas answers only from pages the current user can read. Permission filtering occurs before candidate counts, snippets, ranking, and context assembly; `POST /api/assistant` also requires `assistant.ask` and a per-user rate limit.

## Runtime modes

1. **Local grounded mode** ranks bundled approved knowledge and returns deterministic citations.
2. **OpenAI Responses mode** uses `OPENAI_API_KEY`, permission-filtered context, and `store: false`.
3. **Hosted RAG mode** adds `OPENAI_VECTOR_STORE_ID`; production integrations must retain page access metadata and recheck live access before response assembly.

Run `OPENAI_API_KEY='<key>' pnpm knowledge:ingest` only with an approved corpus.

## No-leak safeguards

- Tenant scope and readable-page IDs are resolved before semantic or lexical ranking.
- Denied candidates contribute no title, count, snippet, or hint.
- Citations identify only readable pages and are checked again at response time.
- Retrieved pages are untrusted data, not instructions.
- The assistant cannot edit, publish, review, or change permissions.
