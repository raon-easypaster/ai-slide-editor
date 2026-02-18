import React from 'react';
import { SlideAnalysis } from '@/types';
import { Type, List, RefreshCw, Play, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EditorProps {
    analysis: SlideAnalysis;
    title: string;
    keyData: string[];
    onTitleChange: (val: string) => void;
    onKeyDataChange: (index: number, val: string) => void;
    onApply: () => void;
    isEditing: boolean;
}

export const PrecisionEditor: React.FC<EditorProps> = ({
    title, keyData,
    onTitleChange, onKeyDataChange,
    onApply, isEditing
}) => {
    return (
        <div className="space-y-6 pb-10 h-full flex flex-col">
            <div className="bg-card border rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-primary/10 rounded-lg"><Target className="w-4 h-4 text-primary" /></div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide">Content Editor</h3>
                    </div>
                    <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase">
                        AI Powered
                    </div>
                </div>

                <div className="p-4 space-y-6 overflow-y-auto flex-1">
                    {/* Title Section */}
                    <section className="space-y-3 p-4 bg-muted/20 rounded-lg border hover:border-primary/20 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <Label className="flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <Type className="w-3.5 h-3.5 mr-2 text-primary" /> Header
                            </Label>
                        </div>
                        <Textarea
                            value={title || ''} onChange={(e) => onTitleChange(e.target.value)} rows={2}
                            className="w-full text-lg font-bold resize-none"
                            placeholder="Enter title text..."
                        />
                    </section>

                    {/* Key Points Section */}
                    <section className="space-y-4">
                        <Label className="flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                            <List className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Content Blocks
                        </Label>
                        <div className="space-y-4">
                            {keyData && keyData.map((item, idx) => (
                                <div key={idx} className="p-4 bg-muted/20 border rounded-xl group transition-all hover:bg-muted/40">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                                            Block {idx + 1}
                                        </span>
                                    </div>
                                    <Input
                                        type="text" value={item || ''} onChange={(e) => onKeyDataChange(idx, e.target.value)}
                                        className="w-full"
                                        placeholder={`Content for block ${idx + 1}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="p-4 border-t bg-muted/20">
                    <Button
                        onClick={onApply} disabled={isEditing}
                        className="w-full h-12 rounded-lg font-bold uppercase tracking-wider transition-all"
                    >
                        {isEditing ? (
                            <span className="flex items-center justify-center">
                                <RefreshCw className="w-4 h-4 mr-3 animate-spin" />
                                Rendering...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                <Play className="w-4 h-4 mr-3 fill-current" />
                                Regenerate Slide
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
