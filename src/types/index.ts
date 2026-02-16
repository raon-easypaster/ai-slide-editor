export interface Slide {
    id: string;
    title?: string;
    content: string; // Markdown or simple text for now
    imageUrl?: string; // URL of the uploaded image/PDF page
    aiPrompt?: string; // The prompt used to generate this slide
    isGenerating?: boolean;
}

export interface GeneratedContent {
    slideId: string;
    content: string;
}
