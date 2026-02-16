"use client";

import { SlideEditor } from "@/components/editor/SlideEditor";
import { SlideList } from "@/components/editor/SlideList";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSlideStore } from "@/store/useSlideStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { SettingsDialog } from "@/components/SettingsDialog";
import { SaveLoadButtons } from "@/components/SaveLoadButtons";
// import { PDFUploader } from "@/components/upload/PDFUploader";
import dynamic from 'next/dynamic';
import { GoogleGenerativeAI } from "@google/generative-ai";
const PDFUploader = dynamic(() => import('@/components/upload/PDFUploader').then(mod => mod.PDFUploader), { ssr: false });
import { Upload } from "lucide-react";

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { slides } = useSlideStore();
  const { apiKey } = useSettingsStore();

  const handleAnalyze = async () => {
    if (!apiKey) {
      alert("Please set your Gemini API Key in Settings first.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      let modelName = useSettingsStore.getState().model || "gemini-1.5-flash";

      const promptParts: any[] = [
        "Analyze the following slides. Provide a summary of the key themes, layout/visual feedback, and potential improvements.\n"
      ];

      slides.forEach((s, i) => {
        promptParts.push(`\n--- Slide ${i + 1} ---\n${s.content}\n`);
        if (s.imageUrl) {
          // Extract base64 data (remove "data:image/png;base64," prefix)
          const base64Data = s.imageUrl.split(",")[1];
          if (base64Data) {
            promptParts.push({
              inlineData: {
                data: base64Data,
                mimeType: "image/png",
              },
            });
          }
        }
      });

      const generateWithFallback = async (currentModelName: string, retryCount = 0): Promise<string> => {
        try {
          const model = genAI.getGenerativeModel({ model: currentModelName });
          const result = await model.generateContent(promptParts);
          const response = await result.response;
          return response.text();
        } catch (error: any) {
          // If 404 or "not found" and not already using flash, try flash
          if ((error.message?.includes("404") || error.message?.includes("not found")) && currentModelName !== "gemini-1.5-flash" && retryCount === 0) {
            console.warn(`Model ${currentModelName} failed. Retrying with gemini-1.5-flash...`);
            return generateWithFallback("gemini-1.5-flash", 1);
          }
          throw error;
        }
      };

      const text = await generateWithFallback(modelName);

      // If we fell back (implicitly, we can't easily tell here without changing return type, but the result is what matters)
      // We could check if useSettingsStore.getState().model !== modelName but we updated the local var.

      setAnalysisResult(text);
    } catch (error: any) {
      console.error("AI Analysis Failed:", error);
      const errorMessage = error.message || "Unknown error occurred";
      setAnalysisResult(`Failed to analyze slides.\n\nError Details: ${errorMessage}\n\nTry selecting 'Gemini 1.5 Flash' in settings.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b flex items-center px-4 justify-between bg-card">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <BrainCircuit className="h-6 w-6" />
          <span>AI Slide Editor</span>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={() => setIsUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload PDF
          </Button>
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? "Analyzing..." : "Analyze All Slides"}
          </Button>
          <SaveLoadButtons />
          <SettingsDialog />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <SlideList />
        <SlideEditor />
      </div>

      {/* Analysis Result Dialog */}
      <Dialog open={!!analysisResult} onOpenChange={(open) => !open && setAnalysisResult(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Analysis Result</DialogTitle>
            <DialogDescription>
              Simultaneous analysis of all slides.
            </DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap p-4 bg-muted rounded-md text-sm font-mono max-h-[60vh] overflow-auto">
            {analysisResult}
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload PDF Slides</DialogTitle>
            <DialogDescription>
              Upload a PDF to parse pages into slides.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <PDFUploader />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
