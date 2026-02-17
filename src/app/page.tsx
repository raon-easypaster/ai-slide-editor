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
import { PrecisionEditor } from "@/components/editor/PrecisionEditor";
const PDFUploader = dynamic(() => import('@/components/upload/PDFUploader').then(mod => mod.PDFUploader), { ssr: false });
import { Upload } from "lucide-react";
import { SlideAnalysis } from "@/types";

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { slides, currentSlideId, updateSlide } = useSlideStore();
  const { apiKey } = useSettingsStore();

  const handleAnalyze = async () => {
    if (!apiKey) {
      alert("Please set your Gemini API Key in Settings first.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const trimmedKey = apiKey.trim();
      const genAI = new GoogleGenerativeAI(trimmedKey);
      let modelName = useSettingsStore.getState().model || "gemini-1.5-flash";

      const currentSlide = slides.find(s => s.id === currentSlideId);
      if (!currentSlide) {
        alert("No slide selected");
        return;
      }

      // JSON Schema for structured output
      const schema = {
        description: "Slide analysis result",
        type: "object",
        properties: {
          title: { type: "string" },
          key_data: { type: "array", items: { type: "string" } },
          design_context: {
            type: "object",
            properties: {
              theme: { type: "string" },
              font_characteristics: { type: "string" },
              visual_elements: { type: "string" }
            },
            required: ["theme", "font_characteristics", "visual_elements"]
          },
          edit_instructions: { type: "string" }
        },
        required: ["title", "key_data", "design_context", "edit_instructions"]
      };

      const promptParts: any[] = [
        `Analyze the following slide image. Return a JSON object with the following structure:
        {
          "title": "Main title of the slide",
          "key_data": ["Point 1", "Point 2", ...],
          "design_context": {
             "theme": "Overall theme colors/mood",
             "font_characteristics": "Font style description",
             "visual_elements": "Description of background/graphics"
          },
          "edit_instructions": "Instructions for recreating this slide"
        }
        Do not use markdown code blocks. Just return the JSON object.`
      ];

      // Analyze ONLY the current slide for Precision Mode
      promptParts.push(`\n--- Slide Content ---\n${currentSlide.content}\n`);
      if (currentSlide.imageUrl) {
        const base64Data = currentSlide.imageUrl.split(",")[1];
        if (base64Data) {
          promptParts.push({
            inlineData: {
              data: base64Data,
              mimeType: "image/png",
            },
          });
        }
      }

      const generateWithFallback = async (currentModelName: string, retryCount = 0): Promise<string> => {
        try {
          const model = genAI.getGenerativeModel({
            model: currentModelName,
            generationConfig: { responseMimeType: "application/json" }
          });
          const result = await model.generateContent(promptParts);
          const response = await result.response;
          return response.text();
        } catch (error: any) {
          console.warn(`Attempt with ${currentModelName} failed.`, error);
          if (currentModelName !== "gemini-1.5-flash" && retryCount === 0) {
            console.log(`Retrying with gemini-1.5-flash...`);
            return generateWithFallback("gemini-1.5-flash", 1);
          }
          throw error;
        }
      };

      const jsonText = await generateWithFallback(modelName);
      const analysis: SlideAnalysis = JSON.parse(jsonText);

      // Update the slide with analysis data
      if (currentSlideId) {
        updateSlide(currentSlideId, {
          analysis,
          editedTitle: analysis.title,
          editedKeyData: analysis.key_data,
          // Default styling
          titleFontSize: 40,
          keyDataFontSizes: Array(analysis.key_data.length).fill(24),
          titlePosition: { h: 'center', v: 'top' },
          keyDataPositions: Array(analysis.key_data.length).fill({ h: 'center', v: 'bottom' }),
          status: 'ready'
        });
      }

      setAnalysisResult("Analysis Complete! Switching to Precision Editor...");
      setTimeout(() => setAnalysisResult(null), 1500);

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
            {isAnalyzing ? "Analyzing..." : "Analyze Current Slide"}
          </Button>
          <SaveLoadButtons />
          <SettingsDialog />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <SlideList />
        <div className="flex-1 flex flex-col overflow-hidden">
          {(() => {
            const currentSlide = slides.find(s => s.id === currentSlideId);
            if (currentSlide && currentSlide.analysis) {
              return (
                <div className="p-4 overflow-y-auto">
                  <PrecisionEditor
                    analysis={currentSlide.analysis}
                    title={currentSlide.editedTitle || ''}
                    keyData={currentSlide.editedKeyData || []}
                    titleFontSize={currentSlide.titleFontSize || 40}
                    keyDataFontSizes={currentSlide.keyDataFontSizes || []}
                    titlePosition={currentSlide.titlePosition || { h: 'center', v: 'top' }}
                    keyDataPositions={currentSlide.keyDataPositions || []}
                    // Update handlers
                    onTitleChange={(v) => updateSlide(currentSlideId!, { editedTitle: v })}
                    onKeyDataChange={(idx, v) => {
                      const d = [...(currentSlide.editedKeyData || [])];
                      d[idx] = v;
                      updateSlide(currentSlideId!, { editedKeyData: d });
                    }}
                    onTitleFontSizeChange={(v) => updateSlide(currentSlideId!, { titleFontSize: v })}
                    onKeyDataFontSizeChange={(idx, v) => {
                      const s = [...(currentSlide.keyDataFontSizes || [])];
                      s[idx] = v;
                      updateSlide(currentSlideId!, { keyDataFontSizes: s });
                    }}
                    onTitlePositionChange={(p) => updateSlide(currentSlideId!, { titlePosition: p })}
                    onKeyDataPositionChange={(idx, p) => {
                      const pos = [...(currentSlide.keyDataPositions || [])];
                      pos[idx] = p;
                      updateSlide(currentSlideId!, { keyDataPositions: pos });
                    }}
                    onApply={() => alert('Regeneration feature coming next!')}
                    isEditing={currentSlide.status === 'editing'}
                  />
                </div>
              )
            }
            return <SlideEditor />;
          })()}
        </div>
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
