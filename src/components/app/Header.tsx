import { CodeXml } from 'lucide-react';

export function Header() {
  return (
    <header 
      className="p-4 shadow-md"
      style={{ backgroundColor: 'hsl(275, 100%, 15%)' }} // Dark Indigo: #4B0082, adjusted for better visibility with HSL(275, 100%, 25%)
    >
      <div className="container mx-auto flex items-center">
        <CodeXml className="h-8 w-8 mr-3 text-primary-foreground" />
        <h1 className="text-2xl font-bold text-primary-foreground">CodeSight</h1>
      </div>
    </header>
  );
}
