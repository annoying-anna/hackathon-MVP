# RUET Study Buddy

Upload a course PDF, then ask questions about it — or generate a structured study plan from the material.

The point is that answers are grounded in *your* uploaded material instead of whatever the model happens to know. If a topic isn't in the PDF, the assistant says so rather than inventing something plausible.

**Live site:** https://hackathon-mvp-three.vercel.app

## How it works

```
PDF  →  pdfjs-dist (client side)  →  sessionStorage
                                  ↓
                          /api/chat (Node runtime)
                                  ↓
                    Gemini generateContent REST call
                                  ↓
                        grounded answer
```

1. **Parsing happens in the browser.** The file is read with `pdfjs-dist`, page by page, and the extracted text is stored in `sessionStorage`. No file is uploaded anywhere.
2. **`/chat` reads that text back** on mount, and redirects to `/` if there's nothing there.
3. **Every question is posted to `/api/chat`**, which builds a constrained prompt and calls the Gemini REST API directly with `fetch`.
4. The `action: "study-plan"` path swaps the prompt for a study-plan generator over the same material.

## The interesting part: constrained generation

The prompt in `lib/gemini.ts` isn't "answer this question" — it's a set of rules the model is told to follow:

- Answer **only** from the provided course material.
- If the answer isn't in the material, reply *"This topic is not covered in the uploaded material."*
- Be concise, use student-friendly language, format with line breaks where it helps.

This is the cheap version of grounding. It's prompt-level rather than retrieval-level — the material is truncated to 30,000 characters before the call, and a real RAG setup (chunking, embeddings, a vector store) is the obvious next step, since a 30k truncation silently drops everything past that point.

## Stack

| Technology | Role |
|---|---|
| Next.js 16 (App Router) | Routing, API route handlers, metadata |
| React 19 | Client components, drag-and-drop upload, chat UI |
| TypeScript | Typed message interface, request/response bodies |
| Tailwind CSS v4 | Layout, theme, drag-over state transitions |
| Gemini `generateContent` REST API | Answer and study-plan generation |
| pdfjs-dist | Client-side PDF text extraction |
| Vercel | Hosting, Node runtime for the API route |

Two things that took more than one commit to get right: the Gemini model name (`gemini-flash-latest` → `gemini-3.1-flash-lite`, which was overloaded), and moving PDF parsing to the client, since the original server-side approach failed on Vercel.

## Getting started

```bash
npm install
```

You need one environment variable:

```bash
GEMINI_API_KEY=your_key_here
```

Then:

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run start
```

The app throws a clear error if `GEMINI_API_KEY` is missing, rather than failing silently on the first question.

## Known gaps

Working prototype, built as a hackathon MVP. Upload, chat and study-plan generation all function, and it's deployed. What it doesn't have yet:

- No retry or rate limiting on the chat endpoint.
- `/api/upload` is a leftover from the original server-side parsing approach and is no longer called by the app.
- Everything lives in one 85-line module and one 272-line client component — it needs splitting before it grows.
