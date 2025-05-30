'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, BarChartBig, Wand2, CheckCircle2, Loader2, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AnalysisPanelProps {
  fixSuggestions: string[];
  bestPractices: string[];
  syntaxErrors: string[]; // Placeholder
  complexityResult: string; // Placeholder
  isLoadingFixes: boolean;
  isLoadingBestPractices: boolean;
}

export function AnalysisPanel({
  fixSuggestions,
  bestPractices,
  syntaxErrors,
  complexityResult,
  isLoadingFixes,
  isLoadingBestPractices,
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
      <ScrollArea className="h-full max-h-[calc(100vh-250px)]"> {/* Adjust max height as needed */}
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
            <TabsTrigger value="complexity" disabled><BarChartBig className="mr-1 h-4 w-4 inline-block"/>Complexity</TabsTrigger>
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
            <Alert variant="default" className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Complexity Estimation</AlertTitle>
              <AlertDescription>
                This feature is planned. Time and space complexity estimations will appear here.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
