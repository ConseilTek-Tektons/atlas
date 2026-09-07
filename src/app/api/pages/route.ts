import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/auth";
import { database } from "@/lib/db";
import { hasEffectivePermission } from "@/lib/rbac-server";

export const runtime = "nodejs";
const workspaceId = process.env.WORKSPACE_ID ?? "00000000-0000-4000-8000-000000000001";
const pageSchema = z.object({ spaceId: z.string().uuid(), parentId: z.string().uuid().nullable().default(null), title: z.string().trim().min(3).max(240), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120), bodyText: z.string().trim().min(1).max(100_000), visibility: z.enum(["private","organisation"]).default("private") });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!await hasEffectivePermission(session.user.roles, "search.use")) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  if (!process.env.DATABASE_URL && !process.env.PGHOST) return NextResponse.json({ data: [], mode: "demo-ui" });
  const elevated = await hasEffectivePermission(session.user.roles, "permissions.manage");
  const rows = elevated
    ? await database()`select p.id,p.title,p.slug,p.status,p.updated_at,s.name as space from page p join space s on s.id=p.space_id where s.organisation_id=${workspaceId} order by p.updated_at desc limit 100`
    : await database()`select distinct p.id,p.title,p.slug,p.status,p.updated_at,s.name as space from page p join space s on s.id=p.space_id join page_permission pp on pp.space_id=s.id or pp.page_id=p.id where s.organisation_id=${workspaceId} and (s.visibility='organisation' or pp.principal_type='organisation') order by p.updated_at desc limit 100`;
  return NextResponse.json({ data: rows, mode: "postgres" });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!await hasEffectivePermission(session.user.roles, "pages.manage")) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  if (!process.env.DATABASE_URL && !process.env.PGHOST) return NextResponse.json({ error: "PostgreSQL is required for persistent pages." }, { status: 503 });
  const parsed = pageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid page.", details: parsed.error.flatten() }, { status: 400 });
  try {
    const created = await database().begin(async (tx) => {
      const [space] = await tx`select id from space where id=${parsed.data.spaceId} and organisation_id=${workspaceId}`;
      if (!space) throw new Error("space_not_found");
      const [page] = await tx`insert into page (space_id,parent_id,slug,title,status) values (${parsed.data.spaceId},${parsed.data.parentId},${parsed.data.slug},${parsed.data.title},'draft') returning *`;
      await tx`insert into page_version (page_id,version,title,body,body_text,change_note) values (${page.id},1,${parsed.data.title},${tx.json({ type: "document", text: parsed.data.bodyText })},${parsed.data.bodyText},'Initial draft')`;
      if (parsed.data.visibility === "organisation") await tx`insert into page_permission (page_id,principal_type,capability) values (${page.id},'organisation','read')`;
      await tx`insert into audit_event (organisation_id,actor_id,action,entity_type,entity_id,payload) values (${workspaceId},${session.user.id},'page.created','page',${page.id},${tx.json({ spaceId: parsed.data.spaceId })})`;
      return page;
    });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    if (String(error).includes("space_not_found")) return NextResponse.json({ error: "Space not found." }, { status: 404 });
    console.error("page.create_failed", { message: String(error) }); return NextResponse.json({ error: "Page could not be created." }, { status: 500 });
  }
}
