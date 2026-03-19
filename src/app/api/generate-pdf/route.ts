import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { ResumePDFDocument } from "@/lib/pdf-document";
import type { TailoredResume } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resume, template = "clean", addWatermark = false } = await req.json();
    if (!resume || !resume.summary) {
      return NextResponse.json({ error: "Invalid resume data" }, { status: 400 });
    }

    const buffer = await renderToBuffer(
      ResumePDFDocument({
        resume: resume as TailoredResume,
        template,
        addWatermark,
      })
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="tailored-resume.pdf"',
      },
    });
  } catch (error) {
    console.error("Generate PDF error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
