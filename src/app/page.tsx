
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from '@/components/app/Header';
import { MainLayout } from '@/components/app/MainLayout';
import { CodeEditorPanel } from '@/components/app/CodeEditorPanel';
import { AnalysisPanel } from '@/components/app/AnalysisPanel';
import { suggestBestPractices, type SuggestBestPracticesInput } from '@/ai/flows/suggest-best-practices';
import { analyzeCodeComplexity, type AnalyzeCodeComplexityInput, type AnalyzeCodeComplexityOutput } from '@/ai/flows/analyze-code-complexity';
import { verifyCodeLanguage, type VerifyCodeLanguageInput } from '@/ai/flows/verify-code-language';
import { useToast } from '@/hooks/use-toast';

const availableLanguages = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
];

type SupportedLanguage = 'python' | 'javascript' | 'cpp' | 'java';

export default function CodeComplexerPage() {
  const [code, setCode] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('python');
  
  const [bestPractices, setBestPractices] = useState<string[]>([]);
  const [complexityAnalysisResult, setComplexityAnalysisResult] = useState<AnalyzeCodeComplexityOutput | null>(null);
  
  const [isLoadingBestPractices, setIsLoadingBestPractices] = useState<boolean>(false);
  const [isLoadingComplexity, setIsLoadingComplexity] = useState<boolean>(false);
  
  const [isLanguageMismatchDetected, setIsLanguageMismatchDetected] = useState<boolean>(false);
  const [isVerifyingLanguage, setIsVerifyingLanguage] = useState<boolean>(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<string>('best-practices');


  const { toast } = useToast();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getLanguageLabel = (value: string): string => {
    const lang = availableLanguages.find(l => l.value === value);
    return lang ? lang.label : value;
  };

  const handleVerifyLanguage = useCallback(async (currentCode: string, currentLanguage: SupportedLanguage) => {
    if (!currentCode.trim()) {
      setIsLanguageMismatchDetected(false);
      return;
    }
    setIsVerifyingLanguage(true);
    setIsLanguageMismatchDetected(false); // Clear previous mismatch before new check

    try {
      const input: VerifyCodeLanguageInput = {
        code: currentCode,
        expectedLanguage: currentLanguage,
      };
      const result = await verifyCodeLanguage(input);
      if (!result.isMatch) {
        setIsLanguageMismatchDetected(true);
        toast({
          title: "Language Mismatch",
          description: `AI suggests this might not be ${getLanguageLabel(currentLanguage)} code. ${result.reasoning || ''} ${result.actualLanguage ? `Detected: ${getLanguageLabel(result.actualLanguage)} (${result.confidence || 'N/A'}).` : ''}`,
          variant: "destructive",
        });
      } else {
        setIsLanguageMismatchDetected(false);
      }
    } catch (error) {
      console.error("Error verifying code language:", error);
      toast({
        title: "Language Check Failed",
        description: `Could not verify code language. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setIsLanguageMismatchDetected(true); // Assume mismatch on error to be safe
    } finally {
      setIsVerifyingLanguage(false);
    }
  }, [toast]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (code.trim()) { // Only verify if there's code
      debounceTimeoutRef.current = setTimeout(() => {
        handleVerifyLanguage(code, selectedLanguage);
      }, 1000); // 1-second debounce
    } else {
      setIsLanguageMismatchDetected(false); // No code, no mismatch
      setIsVerifyingLanguage(false); // Not verifying if no code
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [code, selectedLanguage, handleVerifyLanguage]);


  const handleGetBestPractices = useCallback(async () => {
     if (isLanguageMismatchDetected) {
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
      const input: SuggestBestPracticesInput = { 
        code, 
        language: selectedLanguage
      };
      const result = await suggestBestPractices(input);
      setBestPractices(result.suggestions);
      setActiveAnalysisTab('best-practices');
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
  }, [code, selectedLanguage, toast, isLanguageMismatchDetected]);

  const handleAnalyzeComplexity = useCallback(async () => {
     if (isLanguageMismatchDetected) {
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
      const input: AnalyzeCodeComplexityInput = { 
        code, 
        language: selectedLanguage
      };
      const result = await analyzeCodeComplexity(input);
      setComplexityAnalysisResult(result);
      setActiveAnalysisTab('complexity');
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
  }, [code, selectedLanguage, toast, isLanguageMismatchDetected]);

  // Effect to clear results and errors when language changes
  useEffect(() => {
    setBestPractices([]);
    setComplexityAnalysisResult(null);
    setIsLanguageMismatchDetected(false); 
    setActiveAnalysisTab('best-practices'); // Reset to default tab
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
            onLanguageChange={(langValue) => setSelectedLanguage(langValue as SupportedLanguage)}
            languages={availableLanguages}
            onAnalyzeComplexity={handleAnalyzeComplexity}
            onGetBestPractices={handleGetBestPractices}
            isBestPracticesLoading={isLoadingBestPractices}
            isComplexityLoading={isLoadingComplexity}
            isLanguageMismatchDetected={isLanguageMismatchDetected}
            isVerifyingLanguage={isVerifyingLanguage}
          />
        }
        analysisPanel={
          <AnalysisPanel
            bestPractices={bestPractices}
            syntaxErrors={[]} 
            complexityAnalysisResult={complexityAnalysisResult}
            isLoadingBestPractices={isLoadingBestPractices}
            isLoadingComplexity={isLoadingComplexity}
            activeTab={activeAnalysisTab}
            onTabChange={setActiveAnalysisTab}
          />
        }
      />
    </div>
  );
}
