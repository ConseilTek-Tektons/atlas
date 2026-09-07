import { describe, expect, it } from "vitest";
import { hasPermission, resolveRolesFromClaims } from "./rbac";

describe("Atlas RBAC", () => {
  it("grants wildcard permissions to administrators", () => expect(hasPermission(["admin"], "permissions.manage")).toBe(true));
  it("keeps publishing away from readers", () => expect(hasPermission(["reader"], "publish.manage")).toBe(false));
  it("maps knowledge groups", () => expect(resolveRolesFromClaims({ groups: ["knowledge-editors"] })).toEqual(["editor"]));
});
