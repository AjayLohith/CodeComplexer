
'use client';

import type * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Lightbulb, Calculator, Loader2 } from 'lucide-react'; // Changed CheckCircle2 to Lightbulb

interface CodeEditorPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  languages: Array<{ value: string; label: string }>;
  onAnalyzeComplexity: () => void;
  onGetBestPractices: () => void;
  isBestPracticesLoading: boolean;
  isComplexityLoading: boolean;
  isLanguageMismatchDetected: boolean;
  isVerifyingLanguage: boolean;
}

export function CodeEditorPanel({
  code,
  onCodeChange,
  selectedLanguage,
  onLanguageChange,
  languages,
  onAnalyzeComplexity,
  onGetBestPractices,
  isBestPracticesLoading,
  isComplexityLoading,
  isLanguageMismatchDetected,
  isVerifyingLanguage,
}: CodeEditorPanelProps) {
  const analysisButtonsDisabled = isLanguageMismatchDetected || !code.trim() || isVerifyingLanguage;
  const suggestionsButtonDisabled = isBestPracticesLoading || analysisButtonsDisabled;
  const complexityButtonDisabled = isComplexityLoading || analysisButtonsDisabled;

  return (
    <Card className="h-full flex flex-col shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Calculator className="mr-2 h-6 w-6" /> Runtime Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="language-select">Language</Label>
            {isVerifyingLanguage && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <Select value={selectedLanguage} onValueChange={onLanguageChange} disabled={isVerifyingLanguage}>
            <SelectTrigger id="language-select" className="w-full md:w-[200px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex-grow flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="code-editor">Your Code</Label>
            <Button
              onClick={onGetBestPractices}
              disabled={suggestionsButtonDisabled}
              size="sm"
              variant="outline"
              className="transform transition-transform duration-75 ease-out active:scale-95"
            >
              {isBestPracticesLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              Suggestions
            </Button>
          </div>
          <Textarea
            id="code-editor"
            placeholder="Enter your code here..."
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className="font-geist-mono h-full min-h-[250px] flex-grow resize-none text-sm p-3 rounded-md shadow-inner bg-background/50"
            aria-label="Code Editor"
          />
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={onAnalyzeComplexity} 
            disabled={complexityButtonDisabled}
            variant="default"
            className="w-full transform transition-transform duration-75 ease-out active:scale-95"
          >
            {isComplexityLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Activity className="mr-2 h-4 w-4" />
            )}
            Analyze Complexity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
