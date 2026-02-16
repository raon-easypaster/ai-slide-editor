"use client";

import { useSlideStore } from "@/store/useSlideStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";

export function SlideList() {
    const { slides, currentSlideId, addSlide, removeSlide, setCurrentSlide } = useSlideStore();

    return (
        <div className="w-64 border-r bg-muted/20 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold text-sm">Slides</h2>
                <Button size="icon" variant="ghost" onClick={addSlide}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-2">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={cn(
                                "group relative p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors",
                                currentSlideId === slide.id ? "bg-accent border-primary" : "bg-card"
                            )}
                            onClick={() => setCurrentSlide(slide.id)}
                        >
                            <div className="text-xs text-muted-foreground mb-1">Slide {index + 1}</div>
                            <div className="text-sm line-clamp-2">
                                {slide.content || <span className="text-muted-foreground italic">Empty slide</span>}
                            </div>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeSlide(slide.id);
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
