
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
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<string>('complexity');


  const { toast } = useToast();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousCodeRef = useRef<string>(code);
  const previousLanguageRef = useRef<SupportedLanguage>(selectedLanguage);

  const getLanguageLabel = useCallback((value: string): string => {
    const lang = availableLanguages.find(l => l.value === value);
    return lang ? lang.label : value;
  }, []);

  // Effect for handling language verification and toasting
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!code.trim()) {
      setIsLanguageMismatchDetected(false);
      setIsVerifyingLanguage(false);
      previousCodeRef.current = code;
      previousLanguageRef.current = selectedLanguage;
      return;
    }

    // Only run if code or language actually changed
    if (code === previousCodeRef.current && selectedLanguage === previousLanguageRef.current) {
      return;
    }
    
    const currentCode = code;
    const currentLanguage = selectedLanguage;

    debounceTimeoutRef.current = setTimeout(async () => {
      setIsVerifyingLanguage(true);
      const wasMismatched = isLanguageMismatchDetected; 

      try {
        const input: VerifyCodeLanguageInput = { code: currentCode, expectedLanguage: currentLanguage };
        const result = await verifyCodeLanguage(input);
        
        setIsLanguageMismatchDetected(!result.isMatch);

        if (!result.isMatch) {
          let mismatchDescription = `AI suggests this code may not be ${getLanguageLabel(currentLanguage)}.`;
          if (result.reasoning) mismatchDescription += ` ${result.reasoning}`;
          if (result.actualLanguage) mismatchDescription += ` Detected: ${getLanguageLabel(result.actualLanguage)} (${result.confidence || 'N/A'}).`;
          toast({ title: "Language Mismatch", description: mismatchDescription, variant: "destructive", duration: 3000 });
        } else if (result.isMatch && wasMismatched) {
          // Was a mismatch, now it's a match
          toast({ title: "Language Verified", description: `AI confirms the code now matches ${getLanguageLabel(currentLanguage)}. ${result.reasoning || ''}`, duration: 3000 });
        }
      } catch (error) {
        console.error("Error verifying code language:", error);
        setIsLanguageMismatchDetected(true); 
        toast({
          title: "Language Check Failed",
          description: `Could not verify code language. ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsVerifyingLanguage(false);
      }
    }, 1000);
    
    previousCodeRef.current = currentCode;
    previousLanguageRef.current = currentLanguage;

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [code, selectedLanguage, toast, getLanguageLabel, isLanguageMismatchDetected]);


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
    setBestPractices([]);
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
    setComplexityAnalysisResult(null); 
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
    setBestPractices([]);
    setComplexityAnalysisResult(null);
    if (code.trim() === '') { 
      if (activeAnalysisTab !== 'complexity') {
        setActiveAnalysisTab('complexity'); 
      }
      setIsLanguageMismatchDetected(false); 
    }
  }, [selectedLanguage, code, activeAnalysisTab]);

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
