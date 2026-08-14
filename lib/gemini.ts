import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function chatWithCourseMaterial(
  question: string,
  courseMaterial: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are an intelligent study assistant for RUET (Rajshahi University of Engineering & Technology) students.

Your job is to help students understand their course materials by answering questions accurately and clearly.

RULES:
1. ONLY answer based on the provided course material below.
2. If the answer is not in the material, say "This topic is not covered in the uploaded material."
3. Be concise but thorough.
4. Use simple, student-friendly language.
5. If the question is about a formula or concept, explain it step by step.
6. Format your response nicely with line breaks and bullet points when helpful.

COURSE MATERIAL:
---
${courseMaterial}
---

STUDENT QUESTION: ${question}

Provide a clear, helpful answer:`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

export async function generateStudyPlan(
  courseMaterial: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are a study planning assistant for RUET students.

Based on the following course material, create a structured study plan with:
1. Key topics to cover
2. Suggested order of study
3. Important points for each topic
4. Practice questions for self-testing

COURSE MATERIAL:
---
${courseMaterial}
---

Generate a clear, actionable study plan:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
