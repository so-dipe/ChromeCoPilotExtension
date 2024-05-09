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

    const fetchData = async (url: string, options: FetchOptions = {}) => {
        setLoading(true);
        setError(null);
        setResponse(null);
        try {
            const response = await fetch(url, options);
            if (response.status === 419) {
                const idToken = await refreshIdToken();
                options.headers['Authorization'] = `Bearer ${idToken}`;
                const refreshedResponse = await fetch(url, options);
                if (!refreshedResponse.ok) {
                    console.log("something broke")
                    throw new Error(`HTTP error ${refreshedResponse.status}`);
                }
                setResponse(refreshedResponse);
                return;
            } else if (response.status === 401) {
                chrome.storage.local.clear();
                return;
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

const refreshIdToken: () => Promise<any> = () => {
    const formData = new URLSearchParams();
    const url = `${serverUrl}/refresh_token`
    return new Promise((resolve, reject) => {
        getUserFromStorage().then(user => {
            formData.append('refresh_token', user.refreshToken);
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            }).then(response => {
                if (!response.ok) {
                    chrome.storage.local.clear();
                    reject('Failed to refresh Id token');
                }
                response.json().then(data => {
                    user.refreshToken = data.refresh_token;
                    user.idToken = data.id_token;
                    chrome.storage.local.set({ 'user': user }, () => { })
                    resolve(data.id_token);
                }).catch(error => {reject(error)})
            }).catch(error => reject(error))
        }).catch(error => reject(error))
    })
}