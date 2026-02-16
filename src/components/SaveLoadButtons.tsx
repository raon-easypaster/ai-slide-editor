"use client";

import { useSlideStore } from "@/store/useSlideStore";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useRef } from "react";
import { Slide } from "@/types";

export function SaveLoadButtons() {
    const { slides, addSlides } = useSlideStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        const data = JSON.stringify(slides, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `slide-project-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const loadedSlides = JSON.parse(content) as Slide[];
                if (Array.isArray(loadedSlides)) {
                    // Optional: confirm before overwriting or add to existing?
                    // For now, we append to existing or replace. Let's append to avoid data loss, 
                    // or the store logic I added earlier was 'addSlides' which appends.
                    // If the user wants to "Open Project", they might expect replacement.
                    // But since 'addSlides' appends, let's stick to 'Import'.
                    addSlides(loadedSlides);
                    alert("Project loaded successfully!");
                } else {
                    alert("Invalid project file format.");
                }
            } catch (error) {
                console.error("Failed to load project:", error);
                alert("Failed to load project key.");
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    return (
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleSave} title="Save Project (Export JSON)">
                <Download className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} title="Load Project (Import JSON)">
                <Upload className="h-5 w-5" />
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleLoad}
                accept=".json"
                className="hidden"
            />
        </div>
    );
}
