import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (file.name.endsWith(".pdf")) {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text ?? "";
      await parser.destroy();
    } else if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json({ error: "Only PDF and DOCX files supported" }, { status: 400 });
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text. Try a different file." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: text.trim(), filename: file.name });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json({ error: "Failed to parse file" }, { status: 500 });
  }
}
