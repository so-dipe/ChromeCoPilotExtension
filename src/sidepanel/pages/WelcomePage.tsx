import React, { useEffect, useState } from "react";
import LoginOptions from "../components/LoginOptions";
import EmailLogin from "../components/mailLogin";
import { useLoginStatus } from "../hooks/chromeStorageHooks";
import { useNavigate } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";
import serverUrl from "../../static/config";

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = useLoginStatus();
  const [typedText, setTypedText] = useState("");
  const text = "Chrome CoPilot";
  const [darkMode, setDarkMode] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [emailValue, setEmailValue] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      navigate("profile");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      setTypedText((prevText) => prevText + text[currentIndex]);
      currentIndex++;
      if (currentIndex === text.length - 1) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleContinueWithEmail = () => {
    setShowEmailLogin(true);
  };

  const handleEmailInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEmailValue(event.target.value);
  };

  const handleCloseEmailLogin = () => {
    setShowEmailLogin(false);
  };

  const handleEmailAndPasswordLogin = (password: string) => {
    fetch(`${serverUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: emailValue, password }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Failed to login: ${response.statusText}`);
        }
      })
      .then((data) => {
        console.log(data);
        navigate("profile");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-between h-screen ${
        darkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      <button
        className={`absolute top-0 hover:shadow-lg right-0 m-4 rounded-full p-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white z-10`}
        onClick={toggleDarkMode}
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>
      <div
        className={`p-6 flex items-center justify-center ${
          darkMode ? "dark" : ""
        }`}
      >
        <h1
          className={`text-5xl font-bold mb-8 text-center ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          {typedText}
        </h1>
      </div>
      <div
        className={`shadow-2xl p-6 w-full flex flex-col items-center justify-center  rounded-t-3xl ${
          darkMode ? "bg-gray-800" : "bg-gray-200"
        } h-[60%]`}
      >
        <div
          className={`w-[80%] text-center p-2 text-xl transition-all duration-500 ease-in-out ${
            darkMode
              ? "bg-blue-700 hover:bg-blue-800"
              : "bg-blue-500 hover:bg-blue-600"
          } ${
            darkMode ? "hover:text-white" : "hover:text-black"
          } rounded-xl hover:rounded-sm`}
        >
          <LoginOptions />
        </div>
        <p className={`text-xl p-3 ${darkMode ? "text-white" : "text-black"}`}>
          or
        </p>
        <input
          className={`rounded-xl w-[80%] text-center p-2 ${
            darkMode ? "bg-gray-700 text-white" : "bg-white text-black"
          }`}
          placeholder="enter email"
          type="email"
          onChange={handleEmailInputChange}
        />
        <button
          className={`rounded-xl text-md ${
            darkMode ? "bg-blue-700" : "bg-blue-300"
          } mt-5 w-[80%] text-center p-2`}
          onClick={handleContinueWithEmail}
        >
          continue with email
        </button>
      </div>

      {showEmailLogin && (
        <EmailLogin
          email={emailValue}
          onClose={handleCloseEmailLogin}
          onLogin={handleEmailAndPasswordLogin}
        />
      )}
    </div>
  );
};

export default WelcomePage;
