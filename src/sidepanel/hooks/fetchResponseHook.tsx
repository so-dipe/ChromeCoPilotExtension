import { useState, useEffect } from 'react';
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
                    refreshIdToken()
                    return fetch(url, options)
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
                const data = await response.json()
                user.refreshToken = data.refreshToken;
                user.idToken = data.idToken
                chrome.storage.local.set({'user': user}, () => {})
            })
        })
    } catch (error) {
        throw new Error(error)
    }
};