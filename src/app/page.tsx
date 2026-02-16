"use client";

import { SlideEditor } from "@/components/editor/SlideEditor";
import { SlideList } from "@/components/editor/SlideList";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSlideStore } from "@/store/useSlideStore";

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { slides } = useSlideStore();

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Mock AI Analysis
    setTimeout(() => {
      setAnalysisResult(
        `Analysis of ${slides.length} slides:\n\n` +
        slides.map(s => `- Slide ${s.id.slice(0, 4)}: ${s.content.slice(0, 20)}...`).join('\n') +
        "\n\nOverall Theme: Productive Thinking."
      );
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b flex items-center px-4 justify-between bg-card">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <BrainCircuit className="h-6 w-6" />
          <span>AI Slide Editor</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? "Analyzing..." : "Analyze All Slides"}
          </Button>
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
    </div>
  );
}
