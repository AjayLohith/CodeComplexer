
'use client';

import type { AnalyzeCodeComplexityOutput } from '@/ai/flows/analyze-code-complexity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, BarChartBig, Wand2, CheckCircle2, Loader2, Info, Clock, Scaling } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AnalysisPanelProps {
  fixSuggestions: string[];
  bestPractices: string[];
  syntaxErrors: string[]; 
  complexityAnalysisResult: AnalyzeCodeComplexityOutput | null;
  isLoadingFixes: boolean;
  isLoadingBestPractices: boolean;
  isLoadingComplexity: boolean;
}

export function AnalysisPanel({
  fixSuggestions,
  bestPractices,
  syntaxErrors,
  complexityAnalysisResult,
  isLoadingFixes,
  isLoadingBestPractices,
  isLoadingComplexity,
}: AnalysisPanelProps) {
  
  const renderSuggestions = (suggestions: string[], title: string, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading {title.toLowerCase()}...</p>
        </div>
      );
    }
    if (suggestions.length === 0) {
      return (
        <Alert variant="default" className="mt-4">
          <Info className="h-4 w-4" />
          <AlertTitle>No {title} Available</AlertTitle>
          <AlertDescription>
            There are no {title.toLowerCase()} to display at the moment. Try generating some!
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <ScrollArea className="h-full max-h-[calc(100vh-250px)]">
        <ul className="space-y-3 p-1">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="p-3 bg-muted/50 rounded-md shadow text-sm">
              <pre className="whitespace-pre-wrap font-geist-mono">{suggestion}</pre>
            </li>
          ))}
        </ul>
      </ScrollArea>
    );
  };

  const renderComplexityAnalysis = () => {
    if (isLoadingComplexity) {
      return (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Analyzing complexity...</p>
        </div>
      );
    }
    if (!complexityAnalysisResult) {
      return (
        <Alert variant="default" className="mt-4">
          <Info className="h-4 w-4" />
          <AlertTitle>No Complexity Analysis Available</AlertTitle>
          <AlertDescription>
            Click "Analyze Complexity" in the code input panel to estimate your code's complexity.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <ScrollArea className="h-full max-h-[calc(100vh-250px)]">
        <div className="space-y-4 p-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Time Complexity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold font-geist-mono text-primary">
                {complexityAnalysisResult.timeComplexity}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Scaling className="mr-2 h-5 w-5 text-primary" />
                Space Complexity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold font-geist-mono text-primary">
                {complexityAnalysisResult.spaceComplexity}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-geist-mono text-sm bg-muted/50 p-3 rounded-md">
                {complexityAnalysisResult.explanation}
              </pre>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  };

  return (
    <Card className="h-full flex flex-col shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">Analysis & Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <Tabs defaultValue="fix-suggestions" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="fix-suggestions"><Wand2 className="mr-1 h-4 w-4 inline-block"/>Fixes</TabsTrigger>
            <TabsTrigger value="best-practices"><CheckCircle2 className="mr-1 h-4 w-4 inline-block"/>Practices</TabsTrigger>
            <TabsTrigger value="errors" disabled><AlertTriangle className="mr-1 h-4 w-4 inline-block"/>Errors</TabsTrigger>
            <TabsTrigger value="complexity"><BarChartBig className="mr-1 h-4 w-4 inline-block"/>Complexity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fix-suggestions" className="flex-grow overflow-auto">
            {renderSuggestions(fixSuggestions, "Fix Suggestions", isLoadingFixes)}
          </TabsContent>
          <TabsContent value="best-practices" className="flex-grow overflow-auto">
            {renderSuggestions(bestPractices, "Best Practices", isLoadingBestPractices)}
          </TabsContent>
          <TabsContent value="errors" className="flex-grow overflow-auto">
             <Alert variant="default" className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Real-time Error Detection</AlertTitle>
              <AlertDescription>
                This feature is planned. Syntax errors will be displayed here.
              </AlertDescription>
            </Alert>
          </TabsContent>
          <TabsContent value="complexity" className="flex-grow overflow-auto">
            {renderComplexityAnalysis()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
