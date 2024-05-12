/* This is the component that renders the Chat Page. It contains chat messages and a input to send messages to the
 * server. It works closely with the Messages and StreamMessage Components
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useUserData } from "../hooks/chromeStorageHooks";
import { ConversationsDB, DocumentsDB } from "../../db/db";
import { useFetchData } from "../hooks/fetchResponseHook";
import Messages from "../components/Messages";
import OpenTabs from "../components/OpenTabs";
import "tailwindcss/tailwind.css";
import ProfileButton from "../components/ProfileButton";
import SendMessage from "../components/SendMessage";
import SendMessageError from "../components/SendMessageError";
import { readStreamResponse, sendMessage, generateConversationTitle } from "../utils/send_message_utils";
import MessageSkeleton from "../components/MessageSkeleton";
import LinearProgress from '@mui/material/LinearProgress';

const ChatPage: React.FC = () => {
  const user = useUserData();
  const chatId = useParams<{ chatId: string }>().chatId;
  const { response, error, loading, fetchData } = useFetchData();
  const [db, setDb] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<chrome.tabs.Tab | null>(null);
  // const docsDb = new DocumentsDB();
  const [botResponse, setBotResponse] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [title, setTitle] = useState<string>("UNTITLED");
  const [titleGen, setTitleGen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();
  const [streamResponse, setStreamResponse] = useState<any>();
  const [streamError, setStreamError] = useState<Error>();
  const [streamLoading, setStreamLoading] = useState<boolean>(false);
  const profileMessage = useParams<{ message: string }>().message;
  const [stream, setStream] = useState<boolean>(false);

  const fetchConversation = async () => {
    const db = new ConversationsDB(user.localId);
    const conversation = await db.getConversation(chatId);
    setMessages(conversation.messages);
    setTitle(conversation.title);
    if (conversation.title !== "UNTITLED") {
      setTitleGen(true);
    }
    setDb(db);
  };

  useEffect(() => { 
    if (!user) return;
    fetchConversation().then(() => {
      if (!profileMessage) return;
      setMessage(profileMessage);
      setMessages([...messages, { user: profileMessage, bot: "", type: 'message' }]);
      sendMessage(fetchData, user, profileMessage, []);
    });   
  }, [profileMessage, user]);

  const handleShowDocsClick = () => {
    navigate('/chat/' + chatId + '/contexts');
  };

  useEffect(() => {
    const typewriter = setInterval(() => {
      if (!botResponse) {
        return;
      }
      if (currentIndex < botResponse.length) {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessage = {
            ...updatedMessages[updatedMessages.length - 1],
          };
          const newMessage = {
            ...lastMessage,
            bot: lastMessage.bot + botResponse[currentIndex],
          };
          return [
            ...updatedMessages.slice(0, updatedMessages.length - 1),
            newMessage,
          ];
        });
        setCurrentIndex(currentIndex + 1);
      } else if (currentIndex >= botResponse.length && !stream) {
        clearInterval(typewriter);
        setCurrentIndex(0);
        setBotResponse("");
      }
    }, 20);

    return () => clearInterval(typewriter);
  }, [botResponse, messages]);

  useEffect(() => {
    if (
      title === "UNTITLED" &&
      messages.length > 0 &&
      botResponse &&
      !titleGen
    ) {
      const messagePair = {
        user: messages[0].user,
        bot: botResponse,
      };
      generateConversationTitle(fetchData, user, messagePair);
      setTitleGen(true);
    }
  }, [messages]);

  useEffect(() => {
    readStreamResponse(streamResponse, db, message, chatId, setBotResponse, setStream);
  }, [streamResponse]);

  useEffect(() => {
    if (!response) return;
    if (response.url.indexOf("get_chat_title") !== -1) {
      response.json().then((data) => {
        if (data.text.lenght > 10) {
          const title = message.slice(0, 5)
          setTitle(title);
          db.updateConversationTitle(chatId, title);
        } else {
          setTitle(data.text);
          db.updateConversationTitle(chatId, data.text);
        }
        setTitle(title);
        db.updateConversationTitle(chatId, data.text);
      });
    } else if (response.url.indexOf("stream_response") !== -1) { 
      readStreamResponse(response, db, message, chatId, setBotResponse, setStream);
    }
  }, [response])

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center p-1 cursor-pointer">
        <ProfileButton />
        <h2 className="text-lg font-semibold ml-4 self-center">{title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        <div className="flex flex-row justify-between sticky top-0 bg-white">
          <div className="w-[65%]">
            <OpenTabs
              chatId={chatId}
              onSelectTab={(tab) => setSelectedTab(tab)}
            />
          </div>
          <div className="p-2 bg-slate-900 text-center rounded-lg text-white">
            <button onClick={handleShowDocsClick}>View Documents</button>
          </div>
        </div>

        {<Messages messages={messages} />}
        {streamLoading && <MessageSkeleton />}
        
      </div>
      {streamError && <SendMessageError error={streamError} />}
      <SendMessage chatId={chatId} messages={messages} setMessages={setMessages} setError={setStreamError} setResponse={setStreamResponse} onSendMessage={setMessage} setLoading={setStreamLoading} />
      {loading && <LinearProgress color="secondary" />}
    </div>
  );
};

export default ChatPage;
