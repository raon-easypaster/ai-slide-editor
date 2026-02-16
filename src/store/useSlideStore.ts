import { create } from 'zustand';
import { Slide } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface SlideState {
    slides: Slide[];
    currentSlideId: string | null;
    addSlide: () => void;
    addSlides: (newSlides: Slide[]) => void;
    removeSlide: (id: string) => void;
    updateSlide: (id: string, updates: Partial<Slide>) => void;
    setCurrentSlide: (id: string) => void;
    reorderSlides: (startIndex: number, endIndex: number) => void;
}

import { persist } from 'zustand/middleware';

export const useSlideStore = create<SlideState>()(
    persist(
        (set) => ({
            slides: [
                {
                    id: uuidv4(),
                    content: '# Welcome to AI Slide Editor\n\nStart typing or use AI to generate content.',
                },
            ],
            currentSlideId: null,
            addSlide: () =>
                set((state) => {
                    const newSlide: Slide = {
                        id: uuidv4(),
                        content: '',
                    };
                    return {
                        slides: [...state.slides, newSlide],
                        currentSlideId: newSlide.id,
                    };
                }),
            addSlides: (newSlides) =>
                set((state) => ({
                    slides: [...state.slides, ...newSlides],
                    currentSlideId: newSlides.length > 0 ? newSlides[0].id : state.currentSlideId,
                })),
            removeSlide: (id) =>
                set((state) => ({
                    slides: state.slides.filter((s) => s.id !== id),
                    currentSlideId:
                        state.currentSlideId === id
                            ? state.slides.find((s) => s.id !== id)?.id || null
                            : state.currentSlideId,
                })),
            updateSlide: (id, updates) =>
                set((state) => ({
                    slides: state.slides.map((s) => (s.id === id ? { ...s, ...updates } : s)),
                })),
            setCurrentSlide: (id) => set({ currentSlideId: id }),
            reorderSlides: (startIndex, endIndex) =>
                set((state) => {
                    const newSlides = [...state.slides];
                    const [removed] = newSlides.splice(startIndex, 1);
                    newSlides.splice(endIndex, 0, removed);
                    return { slides: newSlides };
                }),
        }),
        {
            name: 'ai-slide-editor-storage',
        }
    ));
