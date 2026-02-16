"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";
import { useState, useEffect } from "react";

export function SettingsDialog() {
    const { apiKey, setApiKey, model, setModel } = useSettingsStore();
    const [open, setOpen] = useState(false);
    const [tempKey, setTempKey] = useState(apiKey);
    const [tempModel, setTempModel] = useState(model || "gemini-1.5-flash");
    const [customModel, setCustomModel] = useState("");
    const [isCustom, setIsCustom] = useState(false);

    useEffect(() => {
        // If the current model is not in the default list, set it as custom
        const defaultModels = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro", "gemini-pro", "gemini-1.5-flash-8b", "gemini-2.0-flash-exp"];
        if (model && !defaultModels.includes(model)) {
            setTempModel("custom");
            setCustomModel(model);
            setIsCustom(true);
        } else {
            setTempModel(model || "gemini-1.5-flash");
            setIsCustom(false);
        }
    }, [model, open]);

    const handleSave = () => {
        setApiKey(tempKey);
        if (tempModel === "custom") {
            setModel(customModel);
        } else {
            setModel(tempModel);
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Configure your API keys and preferences.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="apiKey" className="text-right">
                            Gemini API Key
                        </Label>
                        <Input
                            id="apiKey"
                            value={tempKey}
                            onChange={(e) => setTempKey(e.target.value)}
                            className="col-span-3"
                            type="password"
                            placeholder="AIzaSy..."
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="model" className="text-right">
                            AI Model
                        </Label>
                        <Select
                            value={tempModel}
                            onValueChange={(val) => {
                                setTempModel(val);
                                setIsCustom(val === "custom");
                            }}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                                <SelectItem value="gemini-1.5-flash-001">Gemini 1.5 Flash 001</SelectItem>
                                <SelectItem value="gemini-1.5-flash-8b">Gemini 1.5 Flash 8B</SelectItem>
                                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                                <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Exp)</SelectItem>
                                <SelectItem value="gemini-pro">Gemini 1.0 Pro</SelectItem>
                                <SelectItem value="custom">Custom Model...</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {isCustom && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customModel" className="text-right">
                                Model Name
                            </Label>
                            <Input
                                id="customModel"
                                value={customModel}
                                onChange={(e) => setCustomModel(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g., gemini-1.5-flash-latest"
                            />
                        </div>
                    )}
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave}>Save changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
