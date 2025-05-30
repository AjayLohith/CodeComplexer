
'use client';

import { useState, useEffect } from 'react';
import { Calculator, Moon, Sun } from 'lucide-react'; // Changed CodeXml to Calculator, added Moon and Sun
import { Button } from '@/components/ui/button';

export function Header() {
  const [theme, setTheme] = useState('dark'); // Default to dark

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialTheme = 'dark'; // Default to dark

    if (storedTheme) {
      initialTheme = storedTheme;
    } else {
       // If no stored theme, respect OS preference but default to dark if no preference detected
      initialTheme = prefersDark ? 'dark' : 'light'; 
    }
    
    setTheme(initialTheme);
    if (initialTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    localStorage.setItem('theme', initialTheme); // Ensure localStorage is set on first load

  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <header 
      className="p-4 shadow-md bg-primary"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Calculator className="h-8 w-8 mr-3 text-primary-foreground" />
          <h1 className="text-2xl font-bold text-primary-foreground">CodeComplexer</h1>
        </div>
        <Button 
          onClick={toggleTheme} 
          variant="ghost" 
          size="icon" 
          className="text-primary-foreground hover:bg-primary/80 focus-visible:ring-primary-foreground"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
