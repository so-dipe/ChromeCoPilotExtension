/* This is the fetchResponseHook.tsx file. It contains a custom Hook for 
 * fetching responses from the server and handling common response errors like
 * 401, 419 (expired Token), etc.
 */
import { useState } from 'react';
import serverUrl from '../../static/config';
import { getUserFromStorage } from '../utils/storage_utils';

interface FetchOptions {
    method?: string,
    headers?: Record<string, string>,
    body?: any
}

export const useFetchData = () => {
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    // const [state, setState] = useState<any>({
    //     response: null,
    //     error: null,
    //     loading: false,
    // });

    const fetchData = async (url: string, options: FetchOptions = {}) => {
        setLoading(true);
        setError(null);
        setResponse(null);
        // setState({response: null, error: null, loading: true})
        try {
            const response = await fetch(url, options);
            if (response.status === 419) {
                refreshIdToken().then(() => {
                    setTimeout(() => {
                        getUserFromStorage().then((user) => {
                            options.headers['Authorization'] = `Bearer ${user.idToken}`
                            fetch(url, options);
                        }).catch((error) => {throw new Error(`Chrome Storage Error ${error}`)});
                    }, 5000);
                    return;
                }).catch((error) => { throw new Error(`Refresh Token Error ${error}`) });
            }
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`)
            }
            setResponse(response);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false)
        }
    };

    return {response, error, loading, fetchData};
}

const refreshIdToken = async () => {
    try {
        getUserFromStorage().then( (user) => {
            const formData = new URLSearchParams();
            formData.append('refresh_token', user.refreshToken);
            fetch(`${serverUrl}/refresh_token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            }).then(async (response) => {
                if (!response.ok) {
                    chrome.storage.local.set({'isLoggedin': false}, () => {})
                    throw new Error(`Failed to refresh token ${response.status}`)
                }
                response.json().then((data) => {
                    user.refreshToken = data.refresh_token
                    user.idToken = data.id_token
                    chrome.storage.local.set({'user': user}, () => {})
                })
                // const data = await response.json()
                // user.refreshToken = data.refresh_token;
                // user.idToken = data.id_token
                // chrome.storage.local.set({'user': user}, () => {})
            })
        })
    } catch (error) {
        throw new Error(error)
    }
};

// const handle419Error = async (response, url, options) => {
//     if (response.status !== 419) { return; }
//     try {
//         const user = await refreshIdToken();
//         const delay = calculateBackoffDelay(); // Implement exponential backoff logic
//         await new Promise(resolve => setTimeout(resolve, delay));
//         const updatedOptions = { ...options };
//         updatedOptions.headers['Authorization'] = `Bearer ${user.idToken}`;
//         await fetch(url, updatedOptions);
//     } catch (error) {
//         console.error("Error refreshing token or retrying request:", error);
//         return Promise.reject(new Error("An error occurred. Please try again later.")); // Generic user-friendly error
//     }
// }