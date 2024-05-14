/* This is the component that renders the Chat Page. It contains chat messages and a input to send messages to the
 * server. It works closely with the Messages and StreamMessage Components
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useLLMProvider, useUserData } from "../hooks/chromeStorageHooks";
import { ConversationsDB, DocumentsDB } from "../../db/db";
import { useFetchData } from "../hooks/fetchResponseHook";
import Messages from "../components/Messages";
import OpenTabs from "../components/OpenTabs";
import "tailwindcss/tailwind.css";
import ProfileButton from "../components/ProfileButton";
import SendMessage from "../components/SendMessage";
import SendMessageError from "../components/SendMessageError";
import { readStreamResponse, readGeminiStreamResponse, sendMessage, generateConversationTitle } from "../utils/send_message_utils";
import MessageSkeleton from "../components/MessageSkeleton";
import LinearProgress from '@mui/material/LinearProgress';
import { generateTitle, generateWithAPI } from "../utils/basic_llm_router";
import '../assets/chat-page.css';

const ChatPage: React.FC = () => {
  const user = useUserData();
  const chatId = useParams<{ chatId: string }>().chatId;
  const { response, error, loading, fetchData } = useFetchData();
  const [db, setDb] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
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
  const llmProvider = useLLMProvider();
  const [pageError, setPageError] = useState<any>();

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
    if (!error) return;
    setPageError(error);
  }, [error])

  useEffect(() => { 
    if (!user) return;
    fetchConversation().then(() => {
      if (!profileMessage) return;
      setMessage(profileMessage);
      setMessages([...messages, { user: profileMessage, bot: "", type: 'message' }]);
      if (llmProvider) {
        generateWithAPI(fetchData, [], profileMessage, llmProvider);
      } else {
        sendMessage(fetchData, user, profileMessage, []);
      }
    });   
  }, [profileMessage, user]);

  const handleShowDocsClick = () => {
    navigate('/chat/' + chatId + '/contexts');
  };

  const handleBackButton = () => {
    navigate(-1);
  }

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
      } else if (currentIndex >= botResponse.length) {
        if (stream) setCurrentIndex(currentIndex + 1)
        else {
          clearInterval(typewriter);
          setCurrentIndex(0);
          setBotResponse("");
        }
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
      if (!llmProvider) {
        generateConversationTitle(fetchData, user, messagePair);
      } else if (llmProvider.version.indexOf('gemini') !== -1) {
        generateTitle(fetchData, messagePair, llmProvider);
      }
      
      setTitleGen(true);
    }
  }, [messages]);

  useEffect(() => {
    if (!llmProvider) {
      readStreamResponse(streamResponse, db, message, chatId, setBotResponse, setStream);
    } else if (llmProvider.version.indexOf('gemini') !== -1) {
      readGeminiStreamResponse(streamResponse, db, message, chatId, setBotResponse, setStream);
    }
  }, [streamResponse]);

  useEffect(() => {
    if (!response) return;
    if (response.url.indexOf("get_chat_title") !== -1) {
      response.json().then((data) => {
        if (data.text.length > 10) {
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
    } else if (response.url.indexOf(":streamGenerateContent?alt=sse&key") !== -1) {
      readGeminiStreamResponse(response, db, message, chatId, setBotResponse, setStream);
    } else if (response.url.indexOf(":generateContent?key=") !== -1) {
      response.json().then(data => {
        const text = data.candidates[0].content.parts[0].text
        if (text.length > 10) {
          const title = message.slice(0, 5)
          setTitle(title);
          db.updateConversationTitle(chatId, title);
        } else {
          setTitle(text);
          db.updateConversationTitle(chatId, text);
        }
        setTitle(title);
        db.updateConversationTitle(chatId, text);
      })
    }
  }, [response])

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center p-1 cursor-pointer">
        <button onClick={handleBackButton} className="back-button">
          <span className="material-symbols-outlined">
            arrow_back_ios
          </span>
        </button>
        <h2 className="text-lg font-semibold ml-4 self-center">{title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-1 messages-container">
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
