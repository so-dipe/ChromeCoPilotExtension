import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../hooks/chromeStorageHooks";
// import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import SendIcon from "@mui/icons-material/Send";

const ProfileSendMessage: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserData();
  const [message, setMessage] = useState<string>("");
  const handleSend = () => {
    const chatId = user.localId + Date.now();
    navigate(`/chat/${chatId}/${message}`);
  };
  return (
    <div className=" w-[90%] items-center justify-center flex flex-row   focus:shadow-outline-purple dark:focus:shadow-outline-purple focus:shadow-lg border border-solid border-slate-300 hover:border-purple-500 dark:hover:border-purple-500 focus:border-purple-500 dark:focus:border-purple-500 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus-visible:outline-0 box-border  rounded-md">
      <textarea
        className="w-[90%] h-10 mr-4 text-sm font-normal font-sans leading-normal p-2 rounded-xl rounded-br-none shadow-lg shadow-slate-100 dark:shadow-slate-900 focus:shadow-outline-purple  bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus-visible:outline-0 box-border resize-none max-h-48"
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
        <SendIcon />
      </button>
    </div>
  );
};

export default ProfileSendMessage;
