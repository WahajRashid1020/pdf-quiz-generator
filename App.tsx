import React, { useState, useCallback } from "react";
import { GoogleGenAI } from "@google/genai";
import { FileUpload } from "./components/FileUpload";
import { DifficultySelector } from "./components/DifficultySelector";
import { QuizDisplay } from "./components/QuizDisplay";
import { Loader } from "./components/Loader";
import { ErrorMessage } from "./components/ErrorMessage";
import { extractTextFromPdf } from "./services/pdfService";
import { generateQuizFromText } from "./services/geminiService";
import { QuizQuestion, DifficultyLevel } from "./types";
import { DIFFICULTIES, GEMINI_MODEL_NAME } from "./constants";

const App: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [pdfText, setPdfText] = useState<string>("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    DifficultyLevel.MEDIUM
  );
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>("upload"); // 'upload', 'processing_pdf', 'generating_quiz', 'quiz_ready'

  const apiKey = process.env.API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }

  const handleFileChange = useCallback(async (file: File | null) => {
    if (!file) {
      setPdfFile(null);
      setPdfFileName("");
      setPdfText("");
      setQuiz(null);
      setError(null);
      setCurrentStep("upload");
      return;
    }

    setPdfFile(file);
    setPdfFileName(file.name);
    setQuiz(null);
    setError(null);
    setIsLoading(true);
    setCurrentStep("processing_pdf");

    try {
      const text = await extractTextFromPdf(file);
      if (!text.trim()) {
        setError(
          "Could not extract text from the PDF, or the PDF is empty. Please try a different PDF."
        );
        setPdfText("");
        setIsLoading(false);
        setCurrentStep("upload");
        return;
      }
      setPdfText(text);
      setError(null);
      setCurrentStep("upload"); // Or a new step like 'pdf_ready'
    } catch (err) {
      console.error("Error processing PDF:", err);
      setError(
        err instanceof Error
          ? `Failed to process PDF: ${err.message}. Please ensure it's a valid PDF.`
          : "An unknown error occurred while processing the PDF."
      );
      setPdfText("");
      setPdfFile(null);
      setPdfFileName("");
      setCurrentStep("upload");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDifficultyChange = useCallback(
    (newDifficulty: DifficultyLevel) => {
      setDifficulty(newDifficulty);
      setQuiz(null); // Reset quiz if difficulty changes
    },
    []
  );

  const handleGenerateQuiz = useCallback(async () => {
    if (!pdfText) {
      setError("Please upload and process a PDF first.");
      return;
    }
    if (!apiKey || !ai) {
      setError("API Key not configured. Cannot generate quiz.");
      console.error("API Key for Gemini is missing.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuiz(null);
    setCurrentStep("generating_quiz");

    try {
      const generatedQuiz = await generateQuizFromText(
        ai,
        pdfText,
        difficulty,
        GEMINI_MODEL_NAME
      );
      if (generatedQuiz && generatedQuiz.length > 0) {
        setQuiz(generatedQuiz);
        setCurrentStep("quiz_ready");
      } else {
        setError(
          "The AI couldn't generate a quiz from the provided text. The PDF content might not be suitable for quiz generation, or the AI service might be temporarily unavailable."
        );
        setCurrentStep("upload");
      }
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError(
        err instanceof Error
          ? `Failed to generate quiz: ${err.message}`
          : "An unknown error occurred while generating the quiz."
      );
      setCurrentStep("upload");
    } finally {
      setIsLoading(false);
    }
  }, [pdfText, difficulty, apiKey, ai]);

  const handleReset = () => {
    setPdfFile(null);
    setPdfFileName("");
    setPdfText("");
    setDifficulty(DifficultyLevel.MEDIUM);
    setQuiz(null);
    setError(null);
    setIsLoading(false);
    setCurrentStep("upload");
    // Also reset the file input visually if possible (requires more direct DOM manipulation or key prop trick)
    // For simplicity, we rely on the user to select a new file if they want to change it.
    // Or, we can add a key to FileUpload component to force re-mount
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 pt-10 bg-slate-900">
      <header className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-500">
          PDF Quiz Generator
        </h1>
        <p className="mt-2 text-slate-400 text-lg">
          Upload a PDF, choose your challenge, and let AI craft your quiz!
        </p>
      </header>

      {!apiKey && (
        <ErrorMessage message="CRITICAL: API Key for Gemini is not configured. The application cannot function." />
      )}

      <main className="w-full max-w-2xl bg-slate-800 shadow-2xl rounded-xl p-6 sm:p-8">
        {isLoading && (
          <Loader
            message={
              currentStep === "processing_pdf"
                ? "Analyzing PDF..."
                : currentStep === "generating_quiz"
                ? "Crafting your quiz with AI..."
                : "Loading..."
            }
          />
        )}

        {error && !isLoading && (
          <ErrorMessage message={error} onClose={() => setError(null)} />
        )}

        {!isLoading && !quiz && (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="pdf-upload"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                1. Upload PDF
              </label>
              <FileUpload
                onFileChange={handleFileChange}
                disabled={isLoading}
                currentFileName={pdfFileName}
              />
              {pdfFileName && !pdfText && !isLoading && !error && (
                <p className="mt-2 text-sm text-yellow-400">
                  Processing "{pdfFileName}" failed or text extraction yielded
                  no content.
                </p>
              )}
              {pdfFileName && pdfText && !isLoading && !error && (
                <p className="mt-2 text-sm text-green-400">
                  Successfully processed "{pdfFileName}". Ready for quiz
                  generation.
                </p>
              )}
            </div>

            {pdfText && (
              <>
                <div>
                  <label
                    htmlFor="difficulty-selector"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    2. Select Difficulty
                  </label>
                  <DifficultySelector
                    currentDifficulty={difficulty}
                    onDifficultyChange={handleDifficultyChange}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isLoading || !pdfText || !apiKey}
                  className="w-full bg-gradient-to-r from-sky-500 to-emerald-600 hover:from-sky-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && currentStep === "generating_quiz"
                    ? "Generating..."
                    : "Generate Quiz"}
                </button>
              </>
            )}
          </div>
        )}

        {quiz && !isLoading && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-sky-400 text-center">
              Your Custom Quiz!
            </h2>
            <QuizDisplay questions={quiz} />
            <button
              onClick={handleReset}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
            >
              Start Over with a New PDF
            </button>
          </div>
        )}
      </main>
      <footer className="mt-12 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} AI Quiz Master</p>
      </footer>
    </div>
  );
};

export default App;
