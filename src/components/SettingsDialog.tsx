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
import { useState } from "react";

export function SettingsDialog() {
    const { apiKey, setApiKey, model, setModel } = useSettingsStore();
    const [open, setOpen] = useState(false);
    const [tempKey, setTempKey] = useState(apiKey);
    const [tempModel, setTempModel] = useState(model || "gemini-1.5-flash");

    const handleSave = () => {
        setApiKey(tempKey);
        setModel(tempModel);
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
                        <Select value={tempModel} onValueChange={setTempModel}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Default)</SelectItem>
                                <SelectItem value="gemini-1.5-flash-001">Gemini 1.5 Flash 001</SelectItem>
                                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave}>Save changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
