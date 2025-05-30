
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/app/Header';
import { MainLayout } from '@/components/app/MainLayout';
import { CodeEditorPanel } from '@/components/app/CodeEditorPanel';
// import { AnalysisPanel } from '@/components/app/AnalysisPanel'; // Removed direct import
import type { AnalyzeCodeComplexityOutput } from '@/ai/flows/analyze-code-complexity';
import { suggestBestPractices, type SuggestBestPracticesInput } from '@/ai/flows/suggest-best-practices';
import { analyzeCodeComplexity, type AnalyzeCodeComplexityInput } from '@/ai/flows/analyze-code-complexity';
import { verifyCodeLanguage, type VerifyCodeLanguageInput, type VerifyCodeLanguageOutput } from '@/ai/flows/verify-code-language';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const AnalysisPanel = dynamic(() => import('@/components/app/AnalysisPanel').then(mod => mod.AnalysisPanel), {
  ssr: false, // Analysis panel is client-side interactive
  loading: () => (
    <div className="p-4 h-full flex flex-col">
      <Skeleton className="h-10 w-1/2 mb-4" />
      <Skeleton className="h-8 w-full mb-2" />
      <Skeleton className="flex-grow w-full" />
    </div>
  ),
});


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
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<string>('complexity');


  const { toast } = useToast();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousCodeRef = useRef<string>(code);
  const previousLanguageRef = useRef<SupportedLanguage>(selectedLanguage);

  const getLanguageLabel = useCallback((value: string): string => {
    const lang = availableLanguages.find(l => l.value === value);
    return lang ? lang.label : value;
  }, []);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const currentCode = code;
    const currentLanguage = selectedLanguage;

    // Only clear mismatch if code is empty
    if (!currentCode.trim()) {
      setIsLanguageMismatchDetected(false);
      setIsVerifyingLanguage(false); // Stop verification if code is cleared
      previousCodeRef.current = currentCode; // Update refs
      previousLanguageRef.current = currentLanguage;
      return;
    }
    
    // Only verify if code or language actually changed from the last verified state
    if (currentCode === previousCodeRef.current && currentLanguage === previousLanguageRef.current) {
      return;
    }
    
    const wasPreviouslyMismatched = isLanguageMismatchDetected;

    debounceTimeoutRef.current = setTimeout(async () => {
      setIsVerifyingLanguage(true);
      try {
        const input: VerifyCodeLanguageInput = { code: currentCode, expectedLanguage: currentLanguage };
        const result = await verifyCodeLanguage(input);
        
        const isNowMismatched = !result.isMatch;
        setIsLanguageMismatchDetected(isNowMismatched); // Update mismatch state based on API
        
        if (isNowMismatched) {
          toast({ 
            title: "Language Mismatch",
            description: "", // Simplified
            variant: "destructive", 
            duration: 3000 
          });
        } else if (wasPreviouslyMismatched) { // Only show "matched" if it was previously mismatched
          toast({ 
            title: "Language Matches", 
            description: "", // Simplified
            duration: 3000 
          });
        }
      } catch (error) {
        console.error("Error verifying code language:", error);
        // Assume mismatch on error to be safe, or handle as neutral
        setIsLanguageMismatchDetected(true); 
        toast({
          title: "Language Check Failed",
          description: `Could not verify code language. ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsVerifyingLanguage(false);
        // Update refs *after* verification attempt
        previousCodeRef.current = currentCode;
        previousLanguageRef.current = currentLanguage;
      }
    }, 1000); // 1-second debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  // Re-run effect if code or selected language changes.
  // isLanguageMismatchDetected is removed to avoid loops with wasPreviouslyMismatched logic
  }, [code, selectedLanguage, toast, getLanguageLabel]);


  const handleGetBestPractices = useCallback(async () => {
     if (isLanguageMismatchDetected) {
       toast({ title: "Language Mismatch", description: "Cannot get best practices. Please ensure the code matches the selected language.", variant: "destructive", duration: 3000 });
       return;
    }
    if (!code.trim()) {
      toast({ title: "Code Missing", description: "Please provide code to analyze for best practices.", variant: "destructive", duration: 3000 });
      return;
    }
    setIsLoadingBestPractices(true);
    setBestPractices([]); // Clear previous results
    try {
      const input: SuggestBestPracticesInput = { code, language: selectedLanguage };
      const result = await suggestBestPractices(input);
      setBestPractices(result.suggestions);
      setActiveAnalysisTab('best-practices');
      toast({ title: "Best Practices Analyzed", description: "AI has provided suggestions for best practices.", duration: 3000 });
    } catch (error) {
      console.error("Error getting best practices:", error);
      toast({ title: "Error", description: `Failed to get best practices. ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive", duration: 3000 });
    } finally {
      setIsLoadingBestPractices(false);
    }
  }, [code, selectedLanguage, toast, isLanguageMismatchDetected]);

  const handleAnalyzeComplexity = useCallback(async () => {
     if (isLanguageMismatchDetected) {
       toast({ title: "Language Mismatch", description: "Cannot analyze complexity. Please ensure the code matches the selected language.", variant: "destructive", duration: 3000 });
       return;
    }
    if (!code.trim()) {
      toast({ title: "Code Missing", description: "Please provide code to analyze for complexity.", variant: "destructive", duration: 3000 });
      return;
    }
    setIsLoadingComplexity(true);
    setComplexityAnalysisResult(null); // Clear previous results
    try {
      const input: AnalyzeCodeComplexityInput = { code, language: selectedLanguage };
      const result = await analyzeCodeComplexity(input);
      setComplexityAnalysisResult(result);
      setActiveAnalysisTab('complexity'); 
      toast({ title: "Complexity Analysis Complete", description: "Analysis complete.", duration: 3000 });
    } catch (error) {
      console.error("Error analyzing complexity:", error);
      toast({ title: "Error", description: `Failed to analyze complexity. ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive", duration: 3000 });
    } finally {
      setIsLoadingComplexity(false);
    }
  }, [code, selectedLanguage, toast, isLanguageMismatchDetected]);

   useEffect(() => {
    // If code is empty, clear all results and reset language mismatch
    if (code.trim() === '' && previousCodeRef.current !== '') { // Check if it was not already empty
      setBestPractices([]);
      setComplexityAnalysisResult(null);
      setActiveAnalysisTab('complexity'); // Reset to default tab
      setIsLanguageMismatchDetected(false); // Reset mismatch state
    } 
    // If only the language changes (and code is not empty), clear results
    // This prevents stale analysis for a different language
    else if (selectedLanguage !== previousLanguageRef.current && code.trim() !== '') {
      setBestPractices([]);
      setComplexityAnalysisResult(null);
      setActiveAnalysisTab('complexity'); 
      // Language verification effect will handle mismatch detection for new language
    }
  }, [selectedLanguage, code]);


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
    
