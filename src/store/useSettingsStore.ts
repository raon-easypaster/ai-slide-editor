import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    apiKey: string;
    setApiKey: (key: string) => void;
    model: string;
    setModel: (model: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            apiKey: '',
            setApiKey: (key) => set({ apiKey: key }),
            model: 'gemini-1.5-flash',
            setModel: (model) => set({ model: model }),
        }),
        {
            name: 'ai-slide-editor-settings',
        }
    )
);
