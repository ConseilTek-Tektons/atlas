export const rbacConfig = {
  roles: {
    owner: { label: "Owner", description: "Full control, including security and workspace policy." },
    admin: { label: "Admin", description: "Manages knowledge, integrations, and access." },
    space_admin: { label: "Space admin", description: "Governs pages and permissions within assigned spaces." },
    editor: { label: "Editor", description: "Creates and edits knowledge pages." },
    reviewer: { label: "Reviewer", description: "Reviews and approves controlled content." },
    reader: { label: "Reader", description: "Searches and reads permitted knowledge." },
    auditor: { label: "Auditor", description: "Reviews page history and governance activity." },
  },
  permissions: {
    "dashboard.view": "View the knowledge workspace", "pages.manage": "Create and edit pages",
    "spaces.manage": "Configure spaces and navigation", "permissions.manage": "Manage page and space permissions",
    "reviews.manage": "Review controlled content", "publish.manage": "Publish approved versions",
    "search.use": "Search readable knowledge", "assistant.ask": "Ask the knowledge copilot",
    "access.manage": "Configure roles and identity mappings", "settings.manage": "Manage workspace integrations and settings",
  },
  rolePermissions: {
    owner: ["*"], admin: ["*"],
    space_admin: ["dashboard.view", "pages.manage", "spaces.manage", "permissions.manage", "reviews.manage", "publish.manage", "search.use", "assistant.ask"],
    editor: ["dashboard.view", "pages.manage", "search.use", "assistant.ask"], reviewer: ["dashboard.view", "reviews.manage", "publish.manage", "search.use", "assistant.ask"],
    reader: ["dashboard.view", "search.use", "assistant.ask"], auditor: ["dashboard.view", "search.use"],
  } as Record<string, readonly string[]>,
  identityGroupMappings: {
    "atlas-owners": "owner", "atlas-admins": "admin", "knowledge-space-admins": "space_admin",
    "knowledge-editors": "editor", "knowledge-reviewers": "reviewer", "knowledge-readers": "reader", "knowledge-auditors": "auditor",
  } as Record<string, string>,
  defaultRole: "reader",
};
