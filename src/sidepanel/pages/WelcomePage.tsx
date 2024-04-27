/*
  This file contains the WelcomePage component which is the first page that the user sees when they open the extension.
  It displays LoginOptions component which allows the user to login to the extension.
  It is only displayed when the user isn't logged in
*/

import React, { useEffect } from 'react';
import LoginOptions from '../components/LoginOptions';
import { useLoginStatus } from '../hooks/chromeStorageHooks';
import { useNavigate } from 'react-router-dom';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();
    const isLoggedIn = useLoginStatus();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('profile');
        }
    }, [isLoggedIn, navigate]);

    return (
      <div>
        <h1>Chrome CoPilot</h1>
        <LoginOptions />
      </div>
    );
  };
  
export default WelcomePage;
