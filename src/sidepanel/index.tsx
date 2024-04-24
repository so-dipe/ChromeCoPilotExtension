import React from 'react';
import { createRoot } from 'react-dom/client';
import useLoginStatus from './hooks/useLoginStatus';
import ProfilePage from './pages/ProfilePage';
import WelcomePage from './pages/WelcomePage';

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);

const App: React.FC = () => {
    const isLoggedIn = useLoginStatus();

    return (
        <React.StrictMode>
          {isLoggedIn ? <ProfilePage /> : <WelcomePage />}
        </React.StrictMode>
      );
    };

root.render(<App />);

