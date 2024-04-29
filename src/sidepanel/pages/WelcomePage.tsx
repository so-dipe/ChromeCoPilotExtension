<<<<<<< HEAD
import React, { useEffect } from "react";
import LoginOptions from "../components/LoginOptions";
import { useLoginStatus } from "../hooks/chromeStorageHooks";
import { useNavigate } from "react-router-dom";
=======
/*
  This file contains the WelcomePage component which is the first page that the user sees when they open the extension.
  It displays LoginOptions component which allows the user to login to the extension.
  It is only displayed when the user isn't logged in
*/

import React, { useEffect } from 'react';
import LoginOptions from '../components/LoginOptions';
import { useLoginStatus } from '../hooks/chromeStorageHooks';
import { useNavigate } from 'react-router-dom';
>>>>>>> 000547b0e2d84ef825066edc8bc0e6e35c7cf017

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = useLoginStatus();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("profile");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center bg-fixed p-5"
      style={{
        backgroundImage:
          "url('https://code-blue.com.au/wp-content/uploads/2024/01/MicrosoftTeams-image-4-Copy-scaled.jpg')",
      }}
    >
      <div className="">
        <div className="bg-white bg-opacity-75 p-8 rounded-lg">
          <h1 className="text-2xl font-bold mb-8 text-center text-gray-800">
            Welcome to Chrome CoPilot
          </h1>
          <LoginOptions />
        </div>
      </div>
<<<<<<< HEAD
    </div>
  );
};

=======
    );
  };
  
>>>>>>> 000547b0e2d84ef825066edc8bc0e6e35c7cf017
export default WelcomePage;
