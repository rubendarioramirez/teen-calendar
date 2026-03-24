import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { useAuth } from './hooks/useAuth.ts';
import { theme } from './theme.ts';
import './index.css';
import './firebase';

function Root() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.bg }}
      />
    );
  }

  if (!user) {
    return <LoginPage onSignIn={signIn} />;
  }

  return <App uid={user.uid} onSignOut={signOut} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
