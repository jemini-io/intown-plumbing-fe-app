import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AppSettingCreateInputObjectSchema } from "@/prisma/zod/schemas/objects"; // Ajusta la ruta si es necesario

function isValidId(id: string): boolean {
  return /^\d+$/.test(id);
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!isValidId(params.id)) {
    return Response.json({ error: "Invalid ID format" }, { status: 400 });
  }
  const setting = await prisma.appSetting.findUnique({
    where: { id: Number(params.id) }
  });
  if (!setting) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(setting);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  if (!isValidId(params.id)) {
    return Response.json({ error: "Invalid ID format" }, { status: 400 });
  }
  const data = await req.json();

  const parsed = AppSettingCreateInputObjectSchema.safeParse(data);
  if (!parsed.success) {
    return Response.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const updated = await prisma.appSetting.update({
      where: { id: Number(params.id) },
      data: parsed.data
    });
    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: "Update failed", details: error }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  if (!isValidId(params.id)) {
    return Response.json({ error: "Invalid ID format" }, { status: 400 });
  }
  try {
    await prisma.appSetting.delete({
      where: { id: Number(params.id) }
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Delete failed", details: error }, { status: 500 });
  }
}
