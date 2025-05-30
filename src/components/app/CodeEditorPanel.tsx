
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, Lightbulb, Wand2, CheckCircle2, BrainCircuit, Loader2, AlertCircle, Info } from 'lucide-react';

interface CodeEditorPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  languages: Array<{ value: string; label: string }>;
  errorMessage: string;
  onErrorMessageChange: (message: string) => void;
  onAnalyzeComplexity: () => void;
  onGetFixSuggestions: () => void;
  onGetBestPractices: () => void;
  isFixesLoading: boolean;
  isBestPracticesLoading: boolean;
  isComplexityLoading: boolean;
  languageMismatchError: string | null;
  isVerifyingLanguage: boolean;
}

export function CodeEditorPanel({
  code,
  onCodeChange,
  selectedLanguage,
  onLanguageChange,
  languages,
  errorMessage,
  onErrorMessageChange,
  onAnalyzeComplexity,
  onGetFixSuggestions,
  onGetBestPractices,
  isFixesLoading,
  isBestPracticesLoading,
  isComplexityLoading,
  languageMismatchError,
  isVerifyingLanguage,
}: CodeEditorPanelProps) {
  const analysisButtonsDisabled = !!languageMismatchError;

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

        {languageMismatchError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Language Mismatch</AlertTitle>
            <AlertDescription>{languageMismatchError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 flex-grow flex flex-col">
          <Label htmlFor="code-editor">Your Code</Label>
          <Textarea
            id="code-editor"
            placeholder="Enter your code here..."
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className="font-geist-mono h-full min-h-[200px] flex-grow resize-none text-sm p-3 rounded-md shadow-inner bg-background/50"
            aria-label="Code Editor"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="error-message">Error Message (for Fix Suggestions)</Label>
          <Textarea
            id="error-message"
            placeholder="Enter any error message you're seeing..."
            value={errorMessage}
            onChange={(e) => onErrorMessageChange(e.target.value)}
            className="font-geist-mono h-24 resize-none text-sm p-3 rounded-md shadow-inner bg-background/50"
            aria-label="Error Message Input"
            disabled={analysisButtonsDisabled}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button 
            onClick={onAnalyzeComplexity} 
            variant="outline" 
            disabled={isComplexityLoading || !code || analysisButtonsDisabled}
          >
            {isComplexityLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Activity className="mr-2 h-4 w-4" />
            )}
            Analyze Complexity
          </Button>
          <Button 
            onClick={onGetFixSuggestions} 
            disabled={isFixesLoading || !code || !errorMessage || analysisButtonsDisabled}
          >
            {isFixesLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Get Fix Suggestions
          </Button>
          <Button 
            onClick={onGetBestPractices} 
            disabled={isBestPracticesLoading || !code || analysisButtonsDisabled}
            className="sm:col-span-2" // Make this button span full width on small screens if only 3 buttons
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
