import React, { useState, useEffect } from "react";
import { useUserData } from "../hooks/chromeStorageHooks";
import Logout from "../components/Logout";
import NewChat from "../components/NewChat";
import { ConversationsDB } from "../../db/db";
import Conversations from "../components/Conversations";
import "tailwindcss/tailwind.css";
import { FiRefreshCcw } from "react-icons/fi";

const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentIndex, text]);

  return <span>{displayedText}</span>;
};

const handleReset = (user) => {
  const db = new ConversationsDB(user.localId);
  db.reset();
};

const ProfilePage: React.FC = () => {
  const user = useUserData();
  const time = new Date();
  const hour = time.getHours();
  let greeting;
  if (hour >= 12 && hour < 18) {
    greeting = "Good Afternoon";
  } else if (hour >= 18) {
    greeting = "Good Evening";
  } else {
    greeting = "Good Morning";
  }

  return (
    <div>
      <Logout />
      <div className="relative pt-5 flex flex-col items-center justify-between h-screen">
        {user && (
          <div>
            <div className="mb-8 text-center">
              {user.photoUrl && (
                <img
                  src={user.photoUrl}
                  alt="Profile"
                  className="rounded-full h-24 w-24 mx-auto"
                />
              )}
              <h2 className="text-2xl mb-5 font-semibold text-gray-800">
                <TypewriterText text={`${greeting}, ${user.firstName}`} />
              </h2>
              <p>what would you like to do </p>
            </div>
            <div className="font-semibold text-md w-70 cursor-pointer ">
              <NewChat />
            </div>
          </div>
        )}

        {/* <button
          className="flex items-center justify-center p-2 bg-blue-500 rounded-md shadow-md mr-2 text-white font-bold hover:bg-blue-600 hover:shadow-lg transition duration-300"
          onClick={() => handleReset(user)}
        >
          <FiRefreshCcw className="w-4 h-4 mr-2" />
          Reset
        </button> */}

        <Conversations />
      </div>
    </div>
  );
};

export default ProfilePage;
