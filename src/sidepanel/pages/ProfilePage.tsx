import React from "react";
import { useUserData } from "../hooks/chromeStorageHooks";
import "tailwindcss/tailwind.css";
import ProfileSendMessage from "../components/ProfileSendMessage";
import ProfileButton from "../components/ProfileButton";
import Recent from "../components/Recent";
import '../assets/profile-page.css';

const getTime = (hour) => {
  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else if (hour >= 17 && hour < 22) {
    return "Good Evening";
  } else if (hour >= 22 && hour < 3) {
    return "Late Night Session?";
  } else {
    return "Good Morning!";
  }
};

const ProfilePage: React.FC = () => {
  const user = useUserData();
  const time = new Date();
  const hour = time.getHours();

  return (
    <div className="container-profilepage">
      <div className="flex justify-between items-center">
        <div className="jaro-one greeting">{getTime(hour)}</div>
        <div className="ml-auto">
          <ProfileButton />
        </div>
      </div>

      <div className="relative pt-5 flex flex-col items-center justify-between profile-send-message">
        {user && <ProfileSendMessage />}
      </div>
      <div className="w-full mt-auto recent-container">
        <Recent />
      </div>
    </div>
  );
};

export default ProfilePage;
