
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
import { Activity, CheckCircle2, BrainCircuit, Loader2 } from 'lucide-react';

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

  return (
    <Card className="h-full flex flex-col shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <BrainCircuit className="mr-2 h-6 w-6" /> Code Input
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
          <Label htmlFor="code-editor">Your Code</Label>
          <Textarea
            id="code-editor"
            placeholder="Enter your code here..."
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className="font-geist-mono h-full min-h-[250px] flex-grow resize-none text-sm p-3 rounded-md shadow-inner bg-background/50"
            aria-label="Code Editor"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button 
            onClick={onAnalyzeComplexity} 
            disabled={isComplexityLoading || analysisButtonsDisabled} // Use default variant
          >
            {isComplexityLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Activity className="mr-2 h-4 w-4" />
            )}
            Analyze Complexity
          </Button>
          <Button 
            onClick={onGetBestPractices} 
            disabled={isBestPracticesLoading || analysisButtonsDisabled}
          >
            {isBestPracticesLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Get Best Practices
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
