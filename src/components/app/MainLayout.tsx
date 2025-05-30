import type { ReactNode } from 'react';

interface MainLayoutProps {
  codeEditorPanel: ReactNode;
  analysisPanel: ReactNode;
}

export function MainLayout({ codeEditorPanel, analysisPanel }: MainLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-68px)]"> {/* Adjust height based on header */}
      <div className="md:w-1/2 p-4 overflow-y-auto h-full">
        {codeEditorPanel}
      </div>
      <div className="md:w-1/2 p-4 border-l border-border overflow-y-auto h-full bg-card">
        {analysisPanel}
      </div>
    </div>
  );
}
