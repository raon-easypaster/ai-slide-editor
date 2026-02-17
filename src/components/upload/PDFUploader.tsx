"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSlideStore } from '@/store/useSlideStore';
import { Slide } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText, Loader2, Image as ImageIcon } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export function PDFUploader() {
    const { setSlides } = useSlideStore();
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            // Handle images directly if implemented
            return;
        }

        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            const newSlides: Slide[] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    await page.render({
                        canvasContext: context,
                        viewport: viewport,
                    } as any).promise;

                    const imageUrl = canvas.toDataURL('image/png');

                    newSlides.push({
                        id: uuidv4(),
                        content: `## Page ${i}\n\nAnalysing content...`,
                        imageUrl: imageUrl,
                    });
                }
            }

            setSlides(newSlides);
        } catch (error: any) {
            console.error("Error processing PDF:", error);
            alert(`Failed to process PDF.\n\nError: ${error.message || error}`);
        } finally {
            setIsProcessing(false);
        }
    }, [setSlides]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg']
        },
        multiple: false
    });

    return (
        <Card
            {...getRootProps()}
            className={`p-8 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
      `}
        >
            <input {...getInputProps()} />
            {isProcessing ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p>Processing PDF...</p>
                </div>
            ) : (
                <>
                    <div className="flex gap-4 mb-4 text-muted-foreground">
                        <FileText className="h-10 w-10" />
                        <ImageIcon className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Drag & drop PDF or Image</h3>
                    <p className="text-sm text-muted-foreground mb-4">Supports .pdf, .jpg, .png</p>
                    <Button variant="secondary">Select File</Button>
                </>
            )}
        </Card>
    );
}
