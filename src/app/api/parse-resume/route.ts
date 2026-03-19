import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { uploadFile } from "@/lib/r2";
import mammoth from "mammoth";
import PDFParser from "pdf2json";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    // Extract text
    if (file.name.endsWith(".pdf")) {
      text = await new Promise<string>((resolve, reject) => {
        const parser = new PDFParser();
        parser.on("pdfParser_dataReady", () => {
          resolve(parser.getRawTextContent());
        });
        parser.on("pdfParser_dataError", (err) => {
          reject(err instanceof Error ? err : err.parserError);
        });
        parser.parseBuffer(buffer);
      });
    } else if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported" },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from file. Try a different file." },
        { status: 422 }
      );
    }

    // Upload original file to R2 for backup
    const fileKey = `resumes/${session.user.id}/${Date.now()}-${file.name}`;
    const contentType = file.name.endsWith(".pdf")
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const fileUrl = await uploadFile(fileKey, buffer, contentType);

    // Save to user profile
    await db
      .update(users)
      .set({
        baseResumeText: text.trim(),
        baseResumeFilename: file.name,
        baseResumeUrl: fileUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      text: text.trim(),
      filename: file.name,
      url: fileUrl,
    });
  } catch (error) {
    console.error("Parse resume error:", error);
    return NextResponse.json(
      { error: "Failed to parse file" },
      { status: 500 }
    );
  }
}
