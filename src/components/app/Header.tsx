import { CodeXml } from 'lucide-react';

export function Header() {
  return (
    <header 
      className="p-4 shadow-md bg-primary" // Use Tailwind class for primary background
    >
      <div className="container mx-auto flex items-center">
        <CodeXml className="h-8 w-8 mr-3 text-primary-foreground" />
        <h1 className="text-2xl font-bold text-primary-foreground">CodeComplexer</h1>
      </div>
    </header>
  );
}
