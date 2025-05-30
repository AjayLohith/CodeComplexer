
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from '@/components/app/Header';
import { MainLayout } from '@/components/app/MainLayout';
import { CodeEditorPanel } from '@/components/app/CodeEditorPanel';
import { AnalysisPanel } from '@/components/app/AnalysisPanel';
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

  const getLanguageLabel = useCallback((value: string): string => {
    const lang = availableLanguages.find(l => l.value === value);
    return lang ? lang.label : value;
  }, []);

  const handleVerifyLanguage = useCallback(async (currentCode: string, currentLanguage: SupportedLanguage) => {
    if (!currentCode.trim()) {
      setIsLanguageMismatchDetected(false);
      setIsVerifyingLanguage(false);
      return;
    }
    setIsVerifyingLanguage(true);
    // Don't reset isLanguageMismatchDetected here, let the API call decide

    try {
      const input: VerifyCodeLanguageInput = {
        code: currentCode,
        expectedLanguage: currentLanguage,
      };
      const result = await verifyCodeLanguage(input);

      if (!result.isMatch) {
        setIsLanguageMismatchDetected(true);
        let mismatchDescription = `AI suggests this code may not be ${getLanguageLabel(currentLanguage)}.`;
        if (result.reasoning) {
          mismatchDescription += ` ${result.reasoning}`;
        }
        if (result.actualLanguage) {
          mismatchDescription += ` Detected: ${getLanguageLabel(result.actualLanguage)} (${result.confidence || 'Confidence not available'}).`;
        }
        toast({
          title: "Language Mismatch",
          description: mismatchDescription,
          variant: "destructive",
        });
      } else { // Code IS a match
        if (isLanguageMismatchDetected) { // It was previously a mismatch, now it's fixed
          toast({
            title: "Language Verified",
            description: `AI confirms the code now matches ${getLanguageLabel(currentLanguage)}. ${result.reasoning || ''}`,
          });
        }
        // Always set mismatch to false if it's a match
        setIsLanguageMismatchDetected(false);
      }
    } catch (error) {
      console.error("Error verifying code language:", error);
      toast({
        title: "Language Check Failed",
        description: `Could not verify code language. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      // Assume mismatch if verification fails, to be safe
      setIsLanguageMismatchDetected(true); 
    } finally {
      setIsVerifyingLanguage(false);
    }
  }, [toast, getLanguageLabel, isLanguageMismatchDetected]); // Added isLanguageMismatchDetected to dependencies

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (code.trim()) { 
      debounceTimeoutRef.current = setTimeout(() => {
        handleVerifyLanguage(code, selectedLanguage);
      }, 1000); 
    } else {
      setIsLanguageMismatchDetected(false); 
      setIsVerifyingLanguage(false); 
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [code, selectedLanguage, handleVerifyLanguage]);


  const handleGetBestPractices = useCallback(async () => {
     if (isLanguageMismatchDetected) {
       toast({ title: "Language Mismatch", description: "Cannot get best practices. Please ensure the code matches the selected language.", variant: "destructive" });
       return;
    }
    if (!code.trim()) {
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
       toast({ title: "Language Mismatch", description: "Cannot analyze complexity. Please ensure the code matches the selected language.", variant: "destructive" });
       return;
    }
    if (!code.trim()) {
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
      setActiveAnalysisTab('complexity'); // Switch to complexity tab
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

  useEffect(() => {
    setBestPractices([]);
    setComplexityAnalysisResult(null);
    // Don't reset isLanguageMismatchDetected here, let the verification logic handle it.
    // However, if the selected language changes, or code is cleared, we should clear existing results.
    if (code.trim() === '') { 
      setActiveAnalysisTab('best-practices'); // Reset tab if code is cleared
      setIsLanguageMismatchDetected(false); // Clear mismatch if code is cleared
    }
  }, [selectedLanguage, code]); // React to selectedLanguage and code changes for clearing results

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
            onTabChange={setActiveAnalysisTab} // Allow manual tab changes
          />
        }
      />
    </div>
  );
}
