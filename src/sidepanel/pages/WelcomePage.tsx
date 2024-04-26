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