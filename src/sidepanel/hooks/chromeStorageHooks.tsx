import { useEffect, useState } from 'react';

export const useUserData = () => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    chrome.storage.local.get(['user'], (result) => {
      const userDataFromStorage = result.user;
      setUserData(userDataFromStorage);
    });
  }, []);

  return userData;
};

export const useLoginStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
        chrome.storage.local.get('isLoggedIn', (data) => {
            const loggedIn = data.isLoggedIn ?? false;
            setIsLoggedIn(loggedIn);
        });
    } 
    checkLoginStatus();
  }, []);

  return isLoggedIn;
};

export const useToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get('token', (data) => {
      console.log(data)
      const tokenFromStorage = data.token;
      setToken(tokenFromStorage);
    });
  }, []);

  return token;
};

export const useRefreshToken = () => {
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get('refreshToken', (data) => {
      const refreshTokenFromStorage = data.refreshToken;
      setRefreshToken(refreshTokenFromStorage);
    });
  }, []);

  return refreshToken;
}
