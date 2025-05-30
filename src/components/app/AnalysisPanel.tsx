
'use client';

import type { AnalyzeCodeComplexityOutput } from '@/ai/flows/analyze-code-complexity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChartBig, CheckCircle2, Loader2, Info, Clock, Scaling } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AnalysisPanelProps {
  bestPractices: string[];
  complexityAnalysisResult: AnalyzeCodeComplexityOutput | null;
  isLoadingBestPractices: boolean;
  isLoadingComplexity: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AnalysisPanel({
  bestPractices,
  complexityAnalysisResult,
  isLoadingBestPractices,
  isLoadingComplexity,
  activeTab,
  onTabChange,
}: AnalysisPanelProps) {
  
  const renderBestPractices = () => {
    if (isLoadingBestPractices) {
      return (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading best practices...</p>
        </div>
      );
    }
    if (bestPractices.length === 0 && !isLoadingBestPractices) {
      return (
        <Alert variant="default" className="mt-4">
          <Info className="h-4 w-4" />
          <AlertTitle>No Best Practices Available</AlertTitle>
          <AlertDescription>
            Enter some code and click "Suggestions" to see AI suggestions.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <ScrollArea className="h-full">
        <ul className="space-y-3 p-1">
          {bestPractices.map((suggestion, index) => (
            <li key={index} className="p-3 bg-muted/50 rounded-md shadow text-sm">
              {/* Using pre with font-geist-sans for best practices suggestions to maintain formatting but use regular font */}
              <pre className="whitespace-pre-wrap font-geist-sans">{suggestion}</pre>
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
    if (!complexityAnalysisResult && !isLoadingComplexity) {
      return (
        <Alert variant="default" className="mt-4">
          <Info className="h-4 w-4" />
          <AlertTitle>No Complexity Analysis Available</AlertTitle>
          <AlertDescription>
            Enter some code and click "Analyze Complexity" to estimate its time and space complexity.
          </AlertDescription>
        </Alert>
      );
    }
     if (complexityAnalysisResult) {
        return (
          <ScrollArea className="h-full">
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
                  {/* Using pre with font-geist-sans for explanation to maintain formatting but use regular font */}
                  <pre className="whitespace-pre-wrap font-geist-sans text-sm bg-muted/50 p-3 rounded-md">
                    {complexityAnalysisResult.explanation}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">Analysis & Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <Tabs value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="complexity"><BarChartBig className="mr-1 h-4 w-4 inline-block"/>Complexity</TabsTrigger>
            <TabsTrigger value="best-practices"><CheckCircle2 className="mr-1 h-4 w-4 inline-block"/>Practices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="complexity" className="flex-grow min-h-0">
            {renderComplexityAnalysis()}
          </TabsContent>
          <TabsContent value="best-practices" className="flex-grow min-h-0">
            {renderBestPractices()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
    
