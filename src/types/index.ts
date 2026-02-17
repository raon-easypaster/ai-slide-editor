// Basic Slide Interface
export interface Slide {
    id: string;
    content: string; // Markdown content (for backward compatibility/simple mode)
    imageUrl?: string; // Original Image URL

    // Structured Analysis Data (New)
    analysis?: SlideAnalysis | null;

    // Edit State (New)
    editedTitle?: string;
    editedKeyData?: string[];
    titleFontSize?: number;
    keyDataFontSizes?: number[];
    titlePosition?: TextPosition;
    keyDataPositions?: TextPosition[];

    finalImage?: string | null; // Result of the regeneration
    status?: 'pending' | 'analyzing' | 'ready' | 'editing' | 'error';
}

export interface TextPosition {
    h: 'left' | 'center' | 'right';
    v: 'top' | 'middle' | 'bottom';
}

export interface SlideAnalysis {
    title: string;
    key_data: string[];
    design_context: {
        theme: string;
        font_characteristics: string;
        visual_elements: string;
    };
    edit_instructions: string;
}

export interface GeneratedContent {
    slideId: string;
    content: string;
}
