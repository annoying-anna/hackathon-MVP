const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const url = `${GEMINI_BASE_URL}/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Gemini API error:", data);
    throw new Error(data?.error?.message || "Gemini API request failed");
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";
}

export async function chatWithCourseMaterial(
  question: string,
  courseMaterial: string
): Promise<string> {
  const truncatedMaterial = courseMaterial.substring(0, 30000);

  const prompt = `You are an intelligent study assistant for RUET (Rajshahi University of Engineering & Technology) students.

RULES:
1. ONLY answer based on the provided course material below.
2. If the answer is not in the material, say "This topic is not covered in the uploaded material."
3. Be concise but thorough.
4. Use simple, student-friendly language.
5. Format your response nicely with line breaks and bullet points when helpful.

COURSE MATERIAL:
---
${truncatedMaterial}
---

STUDENT QUESTION: ${question}

Provide a clear, helpful answer:`;

  return callGemini(prompt);
}

export async function generateStudyPlan(
  courseMaterial: string
): Promise<string> {
  const truncatedMaterial = courseMaterial.substring(0, 30000);

  const prompt = `You are a study planning assistant for RUET students.

Based on the following course material, create a structured study plan with:
1. Key topics to cover
2. Suggested order of study
3. Important points for each topic
4. Practice questions for self-testing

COURSE MATERIAL:
---
${truncatedMaterial}
---

Generate a clear, actionable study plan:`;

  return callGemini(prompt);
}
