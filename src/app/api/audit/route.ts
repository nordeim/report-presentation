import { getFullAudit } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const audit = await getFullAudit();
    return Response.json({ ok: true, audit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Audit load failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
