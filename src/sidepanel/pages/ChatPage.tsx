/* This is the component that renders the Chat Page. It contains chat messages and a input to send messages to the
 * server. It works closely with the Messages and StreamMessage Components
 */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import { useLLMProvider, useUserData } from "../hooks/chromeStorageHooks";
import { ConversationsDB } from "../../db/db";
import { useFetchData } from "../hooks/fetchResponseHook";
import Messages from "../components/Messages";
import Title from "../components/Title";
import "tailwindcss/tailwind.css";
import SendMessage from "../components/SendMessage";
import SendMessageError from "../components/SendMessageError";
import { readStreamResponse, readGeminiStreamResponse, sendMessage } from "../utils/send_message_utils";
import MessageSkeleton from "../components/MessageSkeleton";
import LinearProgress from '@mui/material/LinearProgress';
import { generateWithAPI } from "../utils/basic_llm_router";
import '../assets/chat-page.css';

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const ChatPage: React.FC = () => {
  const user = useUserData();
  const query = useQuery();
  const chatId = useParams<{ chatId: string }>().chatId;
  const { response, error, loading, fetchData } = useFetchData();
  const [db, setDb] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [botResponse, setBotResponse] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();
  const [streamResponse, setStreamResponse] = useState<any>();
  const [streamError, setStreamError] = useState<Error>();
  const [streamLoading, setStreamLoading] = useState<boolean>(false);
  const [stream, setStream] = useState<boolean>(false);
  const llmProvider = useLLMProvider();
  const [pageError, setPageError] = useState<any>();
  const [conversation, setConversation] = useState<any>();

  const fetchConversation = async () => {
    const db = new ConversationsDB(user.localId);
    const conversation = await db.getConversation(chatId);
    setConversation(conversation);
    setMessages(conversation.messages);
    setDb(db);
  };

  useEffect(() => {
    if (!error) return;
    setPageError(error);
  }, [error])

  useEffect(() => { 
    if (!user) return;
    fetchConversation().then(() => {
      if (query.size === 0) return;
      setMessage(query.get("message"));
      setMessages([...messages, { user: query.get("message"), bot: "", type: 'message' }]);
      if (llmProvider) {
        generateWithAPI(fetchData, [], query.get("message"), llmProvider);
      } else {
        sendMessage(fetchData, user, query.get("message"), []);
      }
    });   
  }, [query, user]);

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
          setCurrentIndex(currentIndex + 1);
          return [
            ...updatedMessages.slice(0, updatedMessages.length - 1),
            newMessage,
          ];
        });
      } else if (currentIndex >= botResponse.length) {
        if (stream) {}
        else {
          clearInterval(typewriter);
          setCurrentIndex(0);
          setBotResponse("");
        }
      }
    }, 10);

    return () => clearInterval(typewriter);
  }, [botResponse, messages]);

  useEffect(() => {
    if (!llmProvider) {
      readStreamResponse(streamResponse, db, message, chatId, setBotResponse, setStream);
    } else if (llmProvider.version.indexOf('gemini') !== -1) {
      readGeminiStreamResponse(streamResponse, db, message, chatId, setBotResponse, setStream);
    }
  }, [streamResponse]);

  useEffect(() => {
    if (!response) return;
    if (response.url.indexOf("stream_response") !== -1) { 
      readStreamResponse(response, db, message, chatId, setBotResponse, setStream);
    } else if (response.url.indexOf(":streamGenerateContent?alt=sse&key") !== -1) {
      readGeminiStreamResponse(response, db, message, chatId, setBotResponse, setStream);
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
        {conversation && <Title conversation={conversation} message={message} botResponse={botResponse} />}
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
