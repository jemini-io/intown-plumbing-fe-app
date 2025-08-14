import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AppSettingCreateInputObjectSchema } from "@/prisma/zod/schemas/objects";

export async function GET() {
  await requireAdmin();
  const settings = await prisma.appSetting.findMany();
  return Response.json(settings);
}

export async function POST(req: Request) {
  await requireAdmin();
  const data = await req.json();

  const parsed = AppSettingCreateInputObjectSchema.safeParse(data);
  if (!parsed.success) {
    return Response.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 });
  }

  const created = await prisma.appSetting.create({ data: parsed.data });
  return Response.json(created, { status: 201 });
}