/**
 * LoginOptions.tsx
 * A component to handle different forms of login and store user data to chrome.storage.local
 */
import React from 'react';
import serverUrl from '../../static/config';
import { useNavigate } from 'react-router-dom';

function fetchUserfromFirebase(token: string, navigate: any) {
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
        console.log(data);
        chrome.storage.local.set({ user: data }, () => {
            console.log('User data saved');
        });
        chrome.storage.local.set({ token: data.idToken }, () => {
            console.log('User data saved');
        })
        chrome.storage.local.set({ refreshToken: data.refreshToken }, () => {
            console.log('User data saved');
        })
        chrome.storage.local.set({ isLoggedIn: true });
        navigate('profile');
    })
    .catch((error) => {
        console.error('Error:', error);
        navigate('/');
    });
}

const LoginOptions: React.FC = () => {
    const navigate = useNavigate();
    
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
                            fetchUserfromFirebase(cookie.value, navigate);
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