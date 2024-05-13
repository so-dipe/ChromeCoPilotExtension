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

export const useLLMProvider = () => {
  const [llmProvider, setLLMProvider] = useState<any>(null);

  useEffect(() => {
    chrome.storage.local.get(['llmProvider'], (result) => {
      setLLMProvider(result.llmProvider)
    })
  })
  return llmProvider;
}