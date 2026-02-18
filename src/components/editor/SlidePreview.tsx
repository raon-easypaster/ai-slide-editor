
import React from 'react';
import { SlideAnalysis, TextPosition } from '@/types';
import { cn } from '@/lib/utils';

interface SlidePreviewProps {
    imageUrl?: string;
    title: string;
    keyData: string[];
    titleFontSize: number;
    keyDataFontSizes: number[];
    titlePosition?: TextPosition;
    keyDataPositions?: TextPosition[];
    isAnalyzing: boolean;
    showOverlays?: boolean;
}

export const SlidePreview: React.FC<SlidePreviewProps> = ({
    imageUrl,
    title,
    keyData,
    titleFontSize,
    keyDataFontSizes,
    titlePosition = { h: 'center', v: 'top' },
    keyDataPositions = [],
    isAnalyzing,
    showOverlays = true
}) => {
    // Helper to map abstract positions to CSS classes or styles
    const getPositionStyle = (pos: TextPosition) => {
        const style: React.CSSProperties = { position: 'absolute' };

        // Vertical
        if (pos.v === 'top') style.top = '10%';
        else if (pos.v === 'middle') style.top = '50%';
        else if (pos.v === 'bottom') style.bottom = '10%';

        // Horizontal
        if (pos.h === 'left') style.left = '10%';
        else if (pos.h === 'center') {
            style.left = '50%';
            style.transform = pos.v === 'middle' ? 'translate(-50%, -50%)' : 'translateX(-50%)';
        }
        else if (pos.h === 'right') style.right = '10%';

        return style;
    };

    const getTextAlign = (h: string) => {
        if (h === 'left') return 'text-left';
        if (h === 'right') return 'text-right';
        return 'text-center';
    };

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            {/* Background Image */}
            {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={imageUrl}
                    alt="Slide Background"
                    className={cn(
                        "w-full h-full object-contain transition-all duration-700",
                        isAnalyzing && "opacity-50 blur-sm scale-105"
                    )}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-900">
                    No Image Selected
                </div>
            )}

            {/* Overlays - Only visible if requested and not analyzing */}
            {!isAnalyzing && showOverlays && (
                <div className="absolute inset-0 pointer-events-none p-8">
                    {/* Title */}
                    {title && (
                        <div
                            style={{
                                ...getPositionStyle(titlePosition),
                                fontSize: `${titleFontSize / 2}px`, // Scale down for preview
                                color: 'white',
                                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                            }}
                            className={cn("font-bold leading-tight max-w-[80%]", getTextAlign(titlePosition.h))}
                        >
                            {title}
                        </div>
                    )}

                    {/* Key Data Blocks */}
                    {keyData.map((item, idx) => {
                        const pos = keyDataPositions[idx] || { h: 'center', v: 'bottom' };
                        const fontSize = (keyDataFontSizes[idx] || 24) / 2;
                        return (
                            <div
                                key={idx}
                                style={{
                                    ...getPositionStyle(pos),
                                    fontSize: `${fontSize}px`,
                                    color: 'white',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                }}
                                className={cn("font-medium max-w-[60%]", getTextAlign(pos.h))}
                            >
                                {item}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Loading Overlay */}
            {isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 px-6 py-4 rounded-xl backdrop-blur-md border border-white/10 text-white font-medium animate-pulse">
                        Analyzing slide content...
                    </div>
                </div>
            )}
        </div>
    );
};
