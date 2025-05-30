
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from '@/components/app/Header';
import { MainLayout } from '@/components/app/MainLayout';
import { CodeEditorPanel } from '@/components/app/CodeEditorPanel';
import { AnalysisPanel } from '@/components/app/AnalysisPanel';
import { suggestCodeFixes, type SuggestCodeFixesInput } from '@/ai/flows/suggest-code-fixes';
import { suggestBestPractices, type SuggestBestPracticesInput } from '@/ai/flows/suggest-best-practices';
import { analyzeCodeComplexity, type AnalyzeCodeComplexityInput, type AnalyzeCodeComplexityOutput } from '@/ai/flows/analyze-code-complexity';
import { verifyCodeLanguage, type VerifyCodeLanguageInput, type VerifyCodeLanguageOutput } from '@/ai/flows/verify-code-language';
import { useToast } from '@/hooks/use-toast';

const availableLanguages = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
];

const languageMapForFixes: { [key: string]: 'Python' | 'JavaScript' | 'C++' | 'Java' } = {
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
  java: 'Java',
};

const languageMapForAnalysis: { [key: string]: 'python' | 'javascript' | 'cpp' | 'java' } = {
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
  
  const [languageMismatchError, setLanguageMismatchError] = useState<string | null>(null);
  const [isVerifyingLanguage, setIsVerifyingLanguage] = useState<boolean>(false);

  const { toast } = useToast();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getLanguageLabel = (value: string): string => {
    const lang = availableLanguages.find(l => l.value === value);
    return lang ? lang.label : value;
  };

  const handleVerifyLanguage = useCallback(async (currentCode: string, currentLanguage: string) => {
    if (!currentCode.trim()) {
      setLanguageMismatchError(null);
      return;
    }
    setIsVerifyingLanguage(true);
    setLanguageMismatchError(null); // Clear previous error

    try {
      const langForVerification = languageMapForAnalysis[currentLanguage];
      if (!langForVerification) {
        throw new Error("Invalid language selected for verification.");
      }
      const input: VerifyCodeLanguageInput = {
        code: currentCode,
        expectedLanguage: langForVerification,
      };
      const result = await verifyCodeLanguage(input);
      if (!result.isMatch) {
        setLanguageMismatchError(
          `AI suggests this might not be ${getLanguageLabel(currentLanguage)} code. ${result.reasoning || ''} ${result.actualLanguage ? `Detected: ${getLanguageLabel(result.actualLanguage)} (${result.confidence || 'N/A'}).` : ''}`
        );
      } else {
        setLanguageMismatchError(null);
      }
    } catch (error) {
      console.error("Error verifying code language:", error);
      toast({
        title: "Language Check Failed",
        description: `Could not verify code language. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      // Optionally set a generic mismatch error or allow proceeding
      // setLanguageMismatchError("Could not automatically verify the code's language.");
    } finally {
      setIsVerifyingLanguage(false);
    }
  }, [toast]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      handleVerifyLanguage(code, selectedLanguage);
    }, 1000); // 1-second debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [code, selectedLanguage, handleVerifyLanguage]);


  const handleGetFixSuggestions = useCallback(async () => {
    if (languageMismatchError) {
       toast({ title: "Language Mismatch", description: "Cannot get suggestions due to language mismatch.", variant: "destructive" });
       return;
    }
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
  }, [code, selectedLanguage, errorMessage, toast, languageMismatchError]);

  const handleGetBestPractices = useCallback(async () => {
     if (languageMismatchError) {
       toast({ title: "Language Mismatch", description: "Cannot get best practices due to language mismatch.", variant: "destructive" });
       return;
    }
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
      const langForAnalysis = languageMapForAnalysis[selectedLanguage];
       if (!langForAnalysis) {
        throw new Error("Invalid language selected for best practices analysis.");
      }
      const input: SuggestBestPracticesInput = { 
        code, 
        language: langForAnalysis 
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
  }, [code, selectedLanguage, toast, languageMismatchError]);

  const handleAnalyzeComplexity = useCallback(async () => {
     if (languageMismatchError) {
       toast({ title: "Language Mismatch", description: "Cannot analyze complexity due to language mismatch.", variant: "destructive" });
       return;
    }
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
      const langForComplexity = languageMapForAnalysis[selectedLanguage];
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
    } catch (error)
     {
      console.error("Error analyzing complexity:", error);
      toast({
        title: "Error",
        description: `Failed to analyze complexity. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingComplexity(false);
    }
  }, [code, selectedLanguage, toast, languageMismatchError]);

  // Effect to clear results and errors when language changes (but not the mismatch error itself from this effect)
  useEffect(() => {
    setFixSuggestions([]);
    setBestPractices([]);
    setComplexityAnalysisResult(null);
    // setLanguageMismatchError(null); // This is handled by the debounced effect
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
            languages={availableLanguages}
            errorMessage={errorMessage}
            onErrorMessageChange={setErrorMessage}
            onAnalyzeComplexity={handleAnalyzeComplexity}
            onGetFixSuggestions={handleGetFixSuggestions}
            onGetBestPractices={handleGetBestPractices}
            isFixesLoading={isLoadingFixes}
            isBestPracticesLoading={isLoadingBestPractices}
            isComplexityLoading={isLoadingComplexity}
            languageMismatchError={languageMismatchError}
            isVerifyingLanguage={isVerifyingLanguage}
          />
        }
        analysisPanel={
          <AnalysisPanel
            fixSuggestions={fixSuggestions}
            bestPractices={bestPractices}
            syntaxErrors={[]} // Placeholder
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
