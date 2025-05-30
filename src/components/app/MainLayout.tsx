
import type { ReactNode } from 'react';

interface MainLayoutProps {
  codeEditorPanel: ReactNode;
  analysisPanel: ReactNode;
}

export function MainLayout({ codeEditorPanel, analysisPanel }: MainLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-68px)] overflow-y-auto md:overflow-y-hidden"> {/* Adjust height based on header, enable scroll on mobile */}
      {/* Panel 1: Code Editor */}
      <div className="md:w-1/2 p-4 md:h-full md:overflow-y-auto">
        {codeEditorPanel}
      </div>
      {/* Panel 2: Analysis */}
      <div className="md:w-1/2 p-4 border-t md:border-t-0 md:border-l border-border md:h-full md:overflow-y-auto bg-card">
        {analysisPanel}
      </div>
    </div>
  );
}
