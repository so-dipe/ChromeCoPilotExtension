import React, { useEffect, useState } from "react";
import LoginOptions from "../components/LoginOptions";
import { useLoginStatus } from "../hooks/chromeStorageHooks";
import { useNavigate } from "react-router-dom";

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = useLoginStatus();
  const [typedText, setTypedText] = useState("");
  const text = "Chrome CoPilot";
  const [darkMode, setDarkMode] = useState(false);

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

  return (
    <div
      className={`relative flex flex-col items-center justify-between h-screen ${
        darkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      <button
        className={`absolute top-0 right-0 m-4 rounded-full p-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white z-10`}
        onClick={toggleDarkMode}
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
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
        />
        <button
          className={`rounded-xl text-md ${
            darkMode ? "bg-blue-700" : "bg-blue-300"
          } mt-5 w-[80%] text-center p-2`}
        >
          continue with email
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
