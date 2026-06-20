import { head } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
  const blobUrl = new URL(request.url).searchParams.get("url");
  if (!blobUrl) return NextResponse.json({ error: "Chýba URL." }, { status: 400 });

  try {
    const blob = await head(blobUrl);
    return NextResponse.redirect(blob.downloadUrl);
  } catch {
    return NextResponse.json({ error: "Súbor sa nenašiel." }, { status: 404 });
  }
}
