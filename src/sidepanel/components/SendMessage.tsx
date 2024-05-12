import React, {useEffect, useState} from 'react'
import FileUpload from "../components/FileUpload";
import SendIcon from "@mui/icons-material/Send";
import { CircularProgress } from "@mui/material";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import { useFetchData } from "../hooks/fetchResponseHook";
import { sendMessage, filterMessages } from '../utils/send_message_utils';
import { useUserData } from "../hooks/chromeStorageHooks";

interface SendMessageProps { 
    chatId: string;
    messages: any[];
    setMessages: React.Dispatch<React.SetStateAction<any[]>>;
    setResponse: React.Dispatch<React.SetStateAction<any>>;
    setError: React.Dispatch<React.SetStateAction<Error>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    onSendMessage: (message: string) => void;
}

const SendMessage: React.FC<SendMessageProps> = ({chatId, messages, setMessages, setResponse, setError, setLoading, onSendMessage}) => {
    const [message, setMessage] = useState("");
    const [sentMessage, setSentMessage] = useState("");
    const { response, error, loading, fetchData } = useFetchData();
    const user = useUserData();

    useEffect(() => { 
        if (!sentMessage) return;
        onSendMessage(sentMessage);
        setMessage('');
        setMessages([...messages, { user: sentMessage, bot: "", type: 'message' }]);
        sendMessage(fetchData, user, sentMessage, filterMessages(messages));
    }, [sentMessage]);

    useEffect(() => {   
        setResponse(response);
    }, [response]);

    useEffect(() => {
        setError(error);
    }, [error]);

    useEffect(() => {
        setLoading(loading);
    }, [loading]);

  return (
      <div className="p-1 w-full justify-between flex items-center">
          <TextareaAutosize
              className="w-[90%] text-sm font-normal font-sans leading-normal p-2 rounded-xl rounded-br-none shadow-lg shadow-slate-100 dark:shadow-slate-900 focus:shadow-outline-purple dark:focus:shadow-outline-purple focus:shadow-lg border border-solid border-slate-300 hover:border-purple-500 dark:hover:border-purple-500 focus:border-purple-500 dark:focus:border-purple-500 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus-visible:outline-0 box-border resize-none max-h-48"
              aria-label="empty textarea"
              placeholder="Chat with Chrome CoPilot..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxRows={10}
          />
          <div className="hover:cursor-pointer hover:bg-slate-500 hover:text-black rounded-full p-2 m-1  shadow-slate-100 dark:shadow-slate-900 focus:shadow-outline-purple dark:focus:shadow-outline-purple focus:shadow-lg border border-solid border-slate-300 hover:border-purple-500 dark:hover:border-purple-500 focus:border-purple-500 dark:focus:border-purple-500 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 ">
              <FileUpload chatId={chatId} setMessages={setMessages} />
          </div>

          <button
              className="hover:cursor-pointer"
              onClick={async () => {
                  setSentMessage(message);
              }}
              disabled={loading}
          >
              {message ? (
                  <SendIcon className="text-blue-500" />
              ) : loading ? (
                  <CircularProgress color="secondary" size={25} />
              ) : null}
          </button>
      </div>
  )
}

export default SendMessage