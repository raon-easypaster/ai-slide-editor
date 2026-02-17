
import React from 'react';
import { SlideAnalysis, TextPosition } from '@/types';
import { Type, List, Sparkles, Minus, Plus, Move, RefreshCw, Play, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EditorProps {
    analysis: SlideAnalysis;
    title: string;
    keyData: string[];
    titleFontSize: number;
    keyDataFontSizes: number[];
    titlePosition: TextPosition;
    keyDataPositions: TextPosition[];
    onTitleChange: (val: string) => void;
    onKeyDataChange: (index: number, val: string) => void;
    onTitleFontSizeChange: (val: number) => void;
    onKeyDataFontSizeChange: (index: number, val: number) => void;
    onTitlePositionChange: (pos: TextPosition) => void;
    onKeyDataPositionChange: (index: number, pos: TextPosition) => void;
    onApply: () => void;
    isEditing: boolean;
}

const MiniPositionGrid: React.FC<{ value: TextPosition; onChange: (pos: TextPosition) => void }> = ({ value, onChange }) => {
    const cells: Array<{ v: 'top' | 'middle' | 'bottom', h: 'left' | 'center' | 'right' }> = [
        { v: 'top', h: 'left' }, { v: 'top', h: 'center' }, { v: 'top', h: 'right' },
        { v: 'middle', h: 'left' }, { v: 'middle', h: 'center' }, { v: 'middle', h: 'right' },
        { v: 'bottom', h: 'left' }, { v: 'bottom', h: 'center' }, { v: 'bottom', h: 'right' },
    ];

    return (
        <div className="flex flex-col items-center space-y-1">
            <div className="grid grid-cols-3 gap-1 bg-muted p-1.5 rounded-lg border w-fit h-fit">
                {cells.map((cell, idx) => (
                    <button
                        key={idx}
                        onClick={() => onChange(cell)}
                        title={`${cell.v}-${cell.h}`}
                        className={`w-6 h-6 rounded-sm transition-all duration-200 flex items-center justify-center ${value.v === cell.v && value.h === cell.h
                                ? 'bg-primary text-primary-foreground shadow-sm scale-110'
                                : 'bg-accent hover:bg-accent/80'
                            }`}
                    >
                        {value.v === cell.v && value.h === cell.h && <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                    </button>
                ))}
            </div>
        </div>
    );
};

const FontSizeControl: React.FC<{ value: number; onChange: (val: number) => void }> = ({ value, onChange }) => (
    <div className="flex items-center space-x-1.5 bg-muted border rounded-lg p-1 shadow-sm">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onChange(Math.max(8, value - 5))}><Minus className="w-3 h-3" /></Button>
        <Input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 12)}
            className="w-12 h-6 text-center text-xs p-0 border-none bg-transparent focus-visible:ring-0"
        />
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onChange(Math.min(300, value + 5))}><Plus className="w-3 h-3" /></Button>
    </div>
);

export const PrecisionEditor: React.FC<EditorProps> = ({
    analysis, title, keyData, titleFontSize, keyDataFontSizes, titlePosition, keyDataPositions,
    onTitleChange, onKeyDataChange, onTitleFontSizeChange, onKeyDataFontSizeChange, onTitlePositionChange, onKeyDataPositionChange,
    onApply, isEditing
}) => {
    return (
        <div className="space-y-6 pb-10">
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-primary/10 rounded-lg"><Target className="w-4 h-4 text-primary" /></div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide">Precision Layout Controller</h3>
                    </div>
                    <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase">
                        1000x1000 Core
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    {/* Title Section */}
                    <section className="space-y-3 p-4 bg-muted/20 rounded-lg border hover:border-primary/20 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <Label className="flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <Type className="w-3.5 h-3.5 mr-2 text-primary" /> Header Position
                            </Label>
                            <div className="flex items-center space-x-4">
                                <div className="flex flex-col items-center">
                                    <MiniPositionGrid value={titlePosition || { h: 'center', v: 'top' }} onChange={onTitlePositionChange} />
                                    <span className="text-[10px] text-muted-foreground font-mono mt-1 uppercase">{titlePosition?.v}-{titlePosition?.h}</span>
                                </div>
                                <FontSizeControl value={titleFontSize || 40} onChange={onTitleFontSizeChange} />
                            </div>
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
                            <List className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Content Blocks (Individual)
                        </Label>
                        <div className="space-y-4">
                            {keyData && keyData.map((item, idx) => (
                                <div key={idx} className="p-4 bg-muted/20 border rounded-xl group transition-all hover:bg-muted/40">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                                            <Move className="w-3 h-3 mr-2" /> Block {idx + 1}
                                        </span>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex flex-col items-center">
                                                <MiniPositionGrid value={(keyDataPositions && keyDataPositions[idx]) || { h: 'center', v: 'bottom' }} onChange={(pos) => onKeyDataPositionChange(idx, pos)} />
                                                <span className="text-[10px] text-muted-foreground font-mono mt-1 uppercase">
                                                    {(keyDataPositions && keyDataPositions[idx]?.v) || 'bot'}-{(keyDataPositions && keyDataPositions[idx]?.h) || 'ctr'}
                                                </span>
                                            </div>
                                            <FontSizeControl value={(keyDataFontSizes && keyDataFontSizes[idx]) || 24} onChange={(val) => onKeyDataFontSizeChange(idx, val)} />
                                        </div>
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
            <p className="text-[10px] text-muted-foreground text-center font-medium uppercase tracking-wider px-8">
                Modifying positions uses inpainting to regenerate the slide background.
            </p>
        </div>
    );
};
