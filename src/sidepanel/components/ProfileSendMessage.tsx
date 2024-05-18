import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../hooks/chromeStorageHooks";
import '../assets/profile-send-message.css';
import { v4 as uuidv4 } from 'uuid';

const ProfileSendMessage: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("");

  const handleSend = () => {
    const chatId = uuidv4();
    navigate(`/chat/${chatId}?message=${message}`);
  };

  const handleDisabled = () => {
    return message === "";
  }
  
  return (
    <div className="container-profile-send-message">
      <textarea
        className="profile-message-input"
        aria-label="empty textarea"
        placeholder="Chat with Chrome CoPilot..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ resize: "none" }}
        rows={3}
      />
      <button
        className="text-blue-700 p-2 hover:text-blue-400 transition-all transition-5"
        onClick={handleSend}
        disabled={handleDisabled()}
      >
        <span className="material-symbols-outlined">send</span>
      </button>
    </div>
  );
};

export default ProfileSendMessage;
