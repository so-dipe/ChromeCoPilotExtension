import React from 'react';
import serverUrl from '../../static/config';
import ProfilePage from '../pages/ProfilePage';

function fetchUserfromFirebase(token: string) {
    fetch(`${serverUrl}/auth/oauth/google/get_user`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then((response) => {
     if (response.ok) {
        return response.json();
     } else {
        throw new Error(`Failed to fetch user data: ${response.statusText}`)
     }
    })
    .then ((data) => {
        chrome.storage.local.set({ user: data });
        chrome.storage.local.set({ isLoggedIn: true });
        // return <ProfilePage />
    })
    .catch((error) => {
        console.error('Error:', error);
        // return <WelcomePage />
    });
}

const LoginOptions: React.FC = () => {
    
    const handleGoogleLogin = () => {
        const width = 500;
        const height = 600;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;

        chrome.windows.create({
            url: `${serverUrl}/auth/oauth/google/signin`,
            type: 'popup',
            width,
            height,
            left,
            top,
        }, (window) => {
            const updateListener = async (tabId, changeInfo, tab) => {
                if (tab.windowId === window.id && tab.url && tab.url.startsWith(serverUrl)) {
                    chrome.cookies.get({ name: 'token', url: serverUrl }, async (cookie) => {
                        if (cookie) {
                            chrome.tabs.onUpdated.removeListener(updateListener);
                            chrome.windows.remove(window.id);
                            fetchUserfromFirebase(cookie.value);
                        }
                    });
                    }
                };
            chrome.tabs.onUpdated.addListener(updateListener);
            });
    }
    const handleEmailandPasswordLogin = () => {}
  return (
    <div>
      <button onClick={handleGoogleLogin}>Continue with Google</button>
    </div>
  );
};

export default LoginOptions;