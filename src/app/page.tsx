
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/app/Header';
import { MainLayout } from '@/components/app/MainLayout';
import { CodeEditorPanel } from '@/components/app/CodeEditorPanel';
import { AnalysisPanel } from '@/components/app/AnalysisPanel';
import { suggestCodeFixes, type SuggestCodeFixesInput } from '@/ai/flows/suggest-code-fixes';
import { suggestBestPractices, type SuggestBestPracticesInput } from '@/ai/flows/suggest-best-practices';
import { analyzeCodeComplexity, type AnalyzeCodeComplexityInput, type AnalyzeCodeComplexityOutput } from '@/ai/flows/analyze-code-complexity';
import { useToast } from '@/hooks/use-toast';

const languageMapForFixes: { [key: string]: 'Python' | 'JavaScript' | 'C++' | 'Java' } = {
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
  java: 'Java',
};

const languageMapForComplexity: { [key: string]: 'python' | 'javascript' | 'cpp' | 'java' } = {
  python: 'python',
  javascript: 'javascript',
  cpp: 'cpp',
  java: 'java',
};

export default function CodeSightPage() {
  const [code, setCode] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [fixSuggestions, setFixSuggestions] = useState<string[]>([]);
  const [bestPractices, setBestPractices] = useState<string[]>([]);
  const [complexityAnalysisResult, setComplexityAnalysisResult] = useState<AnalyzeCodeComplexityOutput | null>(null);
  
  const [isLoadingFixes, setIsLoadingFixes] = useState<boolean>(false);
  const [isLoadingBestPractices, setIsLoadingBestPractices] = useState<boolean>(false);
  const [isLoadingComplexity, setIsLoadingComplexity] = useState<boolean>(false);

  const { toast } = useToast();

  // Placeholder state for features not yet implemented
  const [syntaxErrors, setSyntaxErrors] = useState<string[]>([]);


  const handleGetFixSuggestions = useCallback(async () => {
    if (!code || !errorMessage) {
      toast({
        title: "Input Missing",
        description: "Please provide both code and an error message for fix suggestions.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingFixes(true);
    setFixSuggestions([]);
    try {
      const langForFixes = languageMapForFixes[selectedLanguage];
      if (!langForFixes) {
        throw new Error("Invalid language selected for fix suggestions.");
      }
      const input: SuggestCodeFixesInput = { 
        code, 
        language: langForFixes,
        errorMessage 
      };
      const result = await suggestCodeFixes(input);
      setFixSuggestions(result.suggestions);
      toast({
        title: "Fix Suggestions Ready",
        description: "AI has generated potential fixes for your code.",
      });
    } catch (error) {
      console.error("Error getting fix suggestions:", error);
      toast({
        title: "Error",
        description: `Failed to get fix suggestions. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingFixes(false);
    }
  }, [code, selectedLanguage, errorMessage, toast]);

  const handleGetBestPractices = useCallback(async () => {
    if (!code) {
      toast({
        title: "Code Missing",
        description: "Please provide code to analyze for best practices.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingBestPractices(true);
    setBestPractices([]);
    try {
      const input: SuggestBestPracticesInput = { 
        code, 
        language: selectedLanguage as 'python' | 'javascript' | 'cpp' | 'java' 
      };
      const result = await suggestBestPractices(input);
      setBestPractices(result.suggestions);
      toast({
        title: "Best Practices Analyzed",
        description: "AI has provided suggestions for best practices.",
      });
    } catch (error) {
      console.error("Error getting best practices:", error);
      toast({
        title: "Error",
        description: `Failed to get best practices. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingBestPractices(false);
    }
  }, [code, selectedLanguage, toast]);

  const handleAnalyzeComplexity = useCallback(async () => {
    if (!code) {
      toast({
        title: "Code Missing",
        description: "Please provide code to analyze for complexity.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingComplexity(true);
    setComplexityAnalysisResult(null);
    try {
      const langForComplexity = languageMapForComplexity[selectedLanguage];
      if (!langForComplexity) {
        throw new Error("Invalid language selected for complexity analysis.");
      }
      const input: AnalyzeCodeComplexityInput = { 
        code, 
        language: langForComplexity
      };
      const result = await analyzeCodeComplexity(input);
      setComplexityAnalysisResult(result);
      toast({
        title: "Complexity Analysis Complete",
        description: "AI has estimated the code's complexity.",
      });
    } catch (error) {
      console.error("Error analyzing complexity:", error);
      toast({
        title: "Error",
        description: `Failed to analyze complexity. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingComplexity(false);
    }
  }, [code, selectedLanguage, toast]);

  const handleRunCode = () => {
    toast({ title: "Feature Not Implemented", description: "Code execution is coming soon!"});
  };

  // Effect to clear results when language changes
  useEffect(() => {
    setFixSuggestions([]);
    setBestPractices([]);
    setComplexityAnalysisResult(null);
  }, [selectedLanguage]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <MainLayout
        codeEditorPanel={
          <CodeEditorPanel
            code={code}
            onCodeChange={setCode}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            errorMessage={errorMessage}
            onErrorMessageChange={setErrorMessage}
            onRunCode={handleRunCode}
            onAnalyzeComplexity={handleAnalyzeComplexity}
            onGetFixSuggestions={handleGetFixSuggestions}
            onGetBestPractices={handleGetBestPractices}
            isFixesLoading={isLoadingFixes}
            isBestPracticesLoading={isLoadingBestPractices}
            isComplexityLoading={isLoadingComplexity}
          />
        }
        analysisPanel={
          <AnalysisPanel
            fixSuggestions={fixSuggestions}
            bestPractices={bestPractices}
            syntaxErrors={syntaxErrors}
            complexityAnalysisResult={complexityAnalysisResult}
            isLoadingFixes={isLoadingFixes}
            isLoadingBestPractices={isLoadingBestPractices}
            isLoadingComplexity={isLoadingComplexity}
          />
        }
      />
    </div>
  );
}
