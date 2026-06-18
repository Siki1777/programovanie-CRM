"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

type UploadResult = { error: string } | { success: true; fotoUrl: string };

export async function nahrajFoto(formData: FormData): Promise<UploadResult> {
  const file    = formData.get("file")    as File | null;
  const typ     = formData.get("typ")     as "kolega" | "zakaznik" | null;
  const id      = formData.get("id")      as string | null;

  if (!file || !typ || !id)
    return { error: "Chýbajúce parametre." };
  if (file.size > 5 * 1024 * 1024)
    return { error: "Súbor je príliš veľký (max 5 MB)." };
  if (!file.type.startsWith("image/"))
    return { error: "Povolené sú iba obrázky." };

  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const ext      = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeName = `${typ}-${id.replace(/[^a-z0-9-]/gi, "")}-${Date.now()}.${ext}`;
  const filePath = join(uploadDir, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const fotoUrl = `/uploads/${safeName}`;

  if (typ === "kolega") {
    await sql`UPDATE kolega   SET foto_url = ${fotoUrl} WHERE id = ${id}`;
    revalidatePath("/nastavenia");
    revalidatePath("/", "layout");
  } else {
    await sql`UPDATE zakaznik SET foto_url = ${fotoUrl} WHERE id = ${id}`;
    revalidatePath("/zakaznici");
    revalidatePath("/zakazky", "layout");
  }

  return { success: true, fotoUrl };
}
