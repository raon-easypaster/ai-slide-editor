"use client";

import { useSlideStore } from "@/store/useSlideStore";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export function SlideEditor() {
    const { slides, currentSlideId, updateSlide } = useSlideStore();

    const currentSlide = slides.find((s) => s.id === currentSlideId);

    if (!currentSlide) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a slide to edit
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 bg-muted/10 h-full flex flex-col">
            <Card className="flex-1 max-w-3xl mx-auto w-full p-6 shadow-sm flex flex-col">
                {currentSlide.imageUrl && (
                    <div className="mb-4 rounded-md overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={currentSlide.imageUrl} alt="Slide Content" className="w-full h-auto object-contain max-h-[400px]" />
                    </div>
                )}
                <Textarea
                    className="flex-1 resize-none border-none focus-visible:ring-0 text-lg p-0 leading-relaxed"
                    placeholder="Start typing..."
                    value={currentSlide.content}
                    onChange={(e) => updateSlide(currentSlide.id, { content: e.target.value })}
                />
            </Card>
            <div className="text-center mt-4 text-xs text-muted-foreground">
                Markdown supported • AI Analysis Ready
            </div>
        </div>
    );
}
