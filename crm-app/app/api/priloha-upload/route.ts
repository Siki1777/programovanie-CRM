import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

const MAX_SIZE = 4 * 1024 * 1024; // 4 MB – Vercel Hobby serverless limit

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData  = await request.formData();
    const file      = formData.get("file")      as File | null;
    const zakazkaId = (formData.get("zakazkaId") as string)?.trim();

    if (!file || !zakazkaId)
      return NextResponse.json({ error: "Chýbajúce parametre." }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type))
      return NextResponse.json({ error: `Nepodporovaný formát (${file.type}).` }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "Súbor je príliš veľký (max 4 MB)." }, { status: 400 });

    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 100);

    const blob = await put(
      `crm/zakazky/${zakazkaId}/${Date.now()}-${safeName}`,
      file,
      { access: "public", contentType: file.type }
    );

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
