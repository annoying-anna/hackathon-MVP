"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    text: string;
    fileName: string;
    pages: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = useCallback(async (selectedFile: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadResult({
        text: data.text,
        fileName: data.fileName,
        pages: data.pages,
      });

      sessionStorage.setItem("courseMaterial", data.text);
      sessionStorage.setItem("fileName", data.fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleUpload(e.dataTransfer.files[0]);
      }
    },
    [handleUpload]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-green-700 text-white py-4 px-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white text-green-700 rounded-xl px-3 py-1 font-bold text-lg">
              RUET
            </div>
            <div>
              <h1 className="text-xl font-bold">Study Buddy</h1>
              <p className="text-green-200 text-sm">AI-Powered Learning</p>
            </div>
          </div>
          <div className="text-sm text-green-200">
            Built with Gemini AI
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-green-800 mb-4">
            Upload. Ask. Learn.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your course PDFs and get instant AI-powered answers to your
            questions. No more searching through hundreds of pages.
          </p>
        </div>

        {/* Upload Area */}
        {!uploadResult ? (
          <div className="max-w-2xl mx-auto">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? "border-green-500 bg-green-50 scale-105"
                  : "border-green-300 bg-white hover:border-green-400 hover:bg-green-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                  <p className="text-green-700 font-medium">
                    Processing your PDF...
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Drop your course PDF here
                  </h3>
                  <p className="text-gray-500 mb-6">
                    or click to browse files
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Choose PDF File
                  </button>
                </>
              )}
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
          </div>
        ) : (
          /* Upload Success */
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 text-green-700 rounded-full p-2">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">
                    {uploadResult.fileName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {uploadResult.pages} pages •{" "}
                    {Math.round(uploadResult.text.length / 1000)}k characters
                    extracted
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto text-sm text-gray-600">
                {uploadResult.text.substring(0, 500)}...
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setUploadResult(null);
                  setFile(null);
                  sessionStorage.removeItem("courseMaterial");
                  sessionStorage.removeItem("fileName");
                }}
                className="flex-1 border-2 border-green-300 text-green-700 font-semibold py-3 rounded-xl hover:bg-green-50 transition-colors cursor-pointer"
              >
                Upload Different File
              </button>
              <button
                onClick={() => router.push("/chat")}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors animate-pulse-glow cursor-pointer"
              >
                Start Studying →
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "💬",
              title: "Ask Anything",
              desc: "Type any question about your course material and get instant, accurate answers.",
            },
            {
              icon: "🎯",
              title: "Focused Learning",
              desc: "AI answers are grounded in YOUR specific course content, not generic info.",
            },
            {
              icon: "📋",
              title: "Study Plans",
              desc: "Generate personalized study plans based on your course materials.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 text-center"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-green-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-green-200 py-4 px-6 text-center text-sm">
        RUET Study Buddy • Built for Build With AI @ RUET Hackathon
      </footer>
    </div>
  );
}
