import React, { useState, useEffect } from "react";
import { useUserData } from "../hooks/chromeStorageHooks";
import Logout from "../components/Logout";
import NewChat from "../components/NewChat";
import ConversationsDB from "../../db/db";
import "tailwindcss/tailwind.css";

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

  if (user) {
    const db = new ConversationsDB(user.localId, 1);
    console.log(db);
    console.log("conversations", db.getConversations());
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      {user && (
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            <TypewriterText text={`${greeting}, ${user.firstName}`} />
          </h2>
        </div>
      )}
      <div className="flex flex-row items-center font-semibold text-lg  space-x-6">
        <NewChat />
        <Logout />
      </div>
    </div>
  );
};

export default ProfilePage;
