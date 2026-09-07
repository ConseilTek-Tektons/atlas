# Atlas role-based and content access control

Atlas combines feature RBAC with live page/space permissions. `src/config/rbac.ts` defines bootstrap capabilities; PostgreSQL stores tenant overrides and content grants. Feature access never implies access to a restricted page.

| Role | Intended access |
|---|---|
| `owner` | Immutable full access and security ownership |
| `admin` | Full knowledge, integration, and access administration |
| `space_admin` | Pages, space governance, permissions, reviews, publishing, search |
| `editor` | Create/edit pages and search readable content |
| `reviewer` | Review/publish and search readable content |
| `reader` | Dashboard, permission-safe search, assistant |
| `auditor` | Dashboard and readable history/search without mutation |

Default groups are `atlas-owners`, `atlas-admins`, `knowledge-space-admins`, `knowledge-editors`, `knowledge-reviewers`, `knowledge-readers`, and `knowledge-auditors`. Unknown groups receive `reader`; content grants still apply.

Search must apply tenant and page permissions before ranking or returning metadata. The owner feature grant is immutable, tenant policy changes are audited transactionally, and content grants remain separately auditable.
