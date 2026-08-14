import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, fileName } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No text content provided" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text,
      pages: "?",
      fileName: fileName || "unknown.pdf",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
