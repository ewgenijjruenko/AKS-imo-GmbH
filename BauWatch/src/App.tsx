import { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';

function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const savedUser = localStorage.getItem('bauwatch_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Error parsing saved user', e);
      }
    }
    return null;
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('bauwatch_theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bauwatch_theme', theme);
  }, [theme]);

  const handleLogin = (name: string, email: string) => {
    const userData = { name, email };
    setUser(userData);
    localStorage.setItem('bauwatch_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bauwatch_user');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <Dashboard 
          userName={user.name} 
          onLogout={handleLogout} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
    </>
  );
}

export default App;
