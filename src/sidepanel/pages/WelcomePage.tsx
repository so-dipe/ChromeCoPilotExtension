import React, { useEffect, useState } from "react";
import LoginOptions from "../components/LoginOptions";
import { useLoginStatus } from "../hooks/chromeStorageHooks";
import { useNavigate } from "react-router-dom";

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = useLoginStatus();
  const [typedText, setTypedText] = useState("");
  const text = "Chrome CoPilot";

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

  return (
    <div className="flex flex-col items-center justify-between h-screen">
      <div className="p-6 flex items-center justify-center">
        <h1 className="text-5xl font-bold mb-8 text-center text-gray-800">
          {typedText}
        </h1>
      </div>

      <div className="shadow-2xl p-6 w-full flex flex-col items-center justify-center  rounded-t-3xl bg-gray-200 h-[60%]">
        <div className="w-[80%] text-center p-2 text-xl transition-all duration-500 ease-in-out bg-blue-500 hover:bg-blue-600 hover:text-white rounded-xl hover:rounded-sm">
          <LoginOptions />
        </div>
        <p className="text-xl p-3">or</p>
        <input
          className="rounded-xl w-[80%] text-center p-2"
          placeholder="enter email"
          type="email"
        />
        <button className="rounded-xl text-md bg-blue-300 mt-5 w-[80%] text-center p-2">
          continue with email
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
