import React, { useState, useEffect } from "react";
import { useUserData } from "../hooks/chromeStorageHooks";
import Logout from "../components/Logout";
import NewChat from "../components/NewChat";
import { ConversationsDB } from "../../db/db";
import Conversations from "../components/Conversations";
import "tailwindcss/tailwind.css";
import { FiRefreshCcw } from "react-icons/fi";
import ProfileSendMessage from "../components/ProfileSendMessage";
import ProfileButton from "../components/ProfileButton";
import Recent from "../components/Recent";
import '../assets/profile-page.css';
import '../assets/fonts.css';

const getTime = (hour) => {
  if (hour >= 12 && hour < 18) {
    return "Good Afternoon";
  } else if (hour >= 18) {
    return "Good Evening";
  } else {
    return "Good Morning";
  }
}

const handleReset = (user) => {
  const db = new ConversationsDB(user.localId);
  db.reset();
};

const ProfilePage: React.FC = () => {
  const user = useUserData();
  const time = new Date();
  const hour = time.getHours();

  return (
    <div className="container">
      <div className="flex justify-between items-center">
        <div className="jaro-one greeting">{getTime(hour)}</div>
        <div className="ml-auto">
          <ProfileButton />
        </div>
      </div>
      <div className="relative pt-5 flex flex-col items-center justify-between h-screen">
        {user && (
          <ProfileSendMessage />
        )}
      </div>
      <Recent />
    </div>
  );
};

export default ProfilePage;
