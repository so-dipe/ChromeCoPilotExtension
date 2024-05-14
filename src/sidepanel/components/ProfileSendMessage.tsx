import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../hooks/chromeStorageHooks";
// import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import SendIcon from "@mui/icons-material/Send";
import '../assets/profile-send-message.css';

const ProfileSendMessage: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserData();
  const [message, setMessage] = useState<string>("");
  const handleSend = () => {
    const chatId = user.localId + Date.now();
    navigate(`/chat/${chatId}/${message}`);
  };
  return (
    <div className="container-send-message">
      <textarea
        className="message-input"
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
      >
        <span className="material-symbols-outlined">send</span>
      </button>
    </div>
  );
};

export default ProfileSendMessage;
