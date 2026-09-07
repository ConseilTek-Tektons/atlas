import { describe, expect, it } from "vitest";
import { permissionSafeResults } from "./permission-search";

describe("permission-safe search", () => {
  it("removes inaccessible pages before ranking", () => expect(permissionSafeResults([{ id: "secret", title: "Secret", score: 1 }, { id: "public", title: "Runbook", score: 0.8 }], new Set(["public"]))).toEqual([{ id: "public", title: "Runbook", score: 0.8 }]));
});
