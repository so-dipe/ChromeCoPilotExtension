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

const getTime = (hour) => {
  if (hour >= 12 && hour < 18) {
    return "Good Afternoon";
  } else if (hour >= 18) {
    return "Good Evening";
  } else {
    return "Good Morning";
  }
};

const handleReset = (user) => {
  const db = new ConversationsDB(user.localId);
  db.reset();
};

const ProfilePage: React.FC = () => {
  const user = useUserData();
  const time = new Date();
  const hour = time.getHours();
  console.log(user);

  return (
    <div className="p-5">
      <div className="flex flex-row items-center">
        <ProfileButton />
        <div className="px-5">{getTime(hour)} </div>
      </div>

      <div className="relative pt-5 flex flex-col items-center justify-between">
        {user && <ProfileSendMessage />}
      </div>
      <p className="font-bold text-center mt-10 mb-5">Previous Conversations</p>
      <div className="w-full">
        <Recent />
      </div>
    </div>
  );
};

export default ProfilePage;
