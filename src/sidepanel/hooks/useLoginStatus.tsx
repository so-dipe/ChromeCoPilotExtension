import { useEffect, useState } from 'react';

const useLoginStatus = () => {
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

export default useLoginStatus;