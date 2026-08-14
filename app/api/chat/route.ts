import { NextRequest, NextResponse } from "next/server";
import { chatWithCourseMaterial, generateStudyPlan } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, courseMaterial, action } = body;

    if (!courseMaterial) {
      return NextResponse.json(
        { error: "No course material uploaded. Please upload a PDF first." },
        { status: 400 }
      );
    }

    let response: string;

    if (action === "study-plan") {
      response = await generateStudyPlan(courseMaterial);
    } else {
      if (!question) {
        return NextResponse.json(
          { error: "Please enter a question" },
          { status: 400 }
        );
      }
      response = await chatWithCourseMaterial(question, courseMaterial);
    }

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to get response from AI" },
      { status: 500 }
    );
  }
}
