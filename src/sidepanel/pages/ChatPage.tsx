/* This is the component that renders the Chat Page. It contains chat messages and a input to send messages to the
 * server. It works closely with the Messages and StreamMessage Components
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useUserData } from "../hooks/chromeStorageHooks";
import serverUrl from "../../static/config";
import { ConversationsDB, DocumentsDB } from "../../db/db";
import { useFetchData } from "../hooks/fetchResponseHook";
import Messages from "../components/Messages";
import OpenTabs from "../components/OpenTabs";
import FileUpload from "../components/FileUpload";
import "tailwindcss/tailwind.css";
import ProfileButton from "../components/ProfileButton";
import SendIcon from "@mui/icons-material/Send";
import { CircularProgress } from "@mui/material";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

const messagePairsToList = (messages) => {
  if (!Array.isArray(messages)) {
    throw new Error("Messages must be an array");
  }

  return messages.flatMap((messagePair) => [
    { role: "user", content: messagePair.user },
    { role: "model", content: messagePair.bot },
  ]);
};

const generateConversationTitle = async (fetchData, user, messagePair) => {
  const params = new URLSearchParams({
    prompt: messagePair.user,
    response: messagePair.bot,
  });
  const url = `${serverUrl}/api/v1/messaging/get_chat_title?${params.toString()}`;
  await fetchData(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${user.idToken}`,
    },
  });
};

const sendMessage = async (fetchData, user, message, messages) => {
  const url = `${serverUrl}/api/v1/messaging/stream_response`;
  await fetchData(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.idToken}`,
    },
    body: JSON.stringify({
      message: message,
      history: messagePairsToList(messages),
    }),
  });
};

const ChatPage: React.FC = () => {
  const user = useUserData();
  const chatId = useParams<{ chatId: string }>().chatId;
  const { response, error, loading, fetchData } = useFetchData();
  const [db, setDb] = useState<any>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<chrome.tabs.Tab | null>(null);
  const [docsDb, setDocsDb] = useState<any>(null);
  const [botResponse, setBotResponse] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [title, setTitle] = useState<string>("UNTITLED");
  const [titleGen, setTitleGen] = useState<boolean>(false);
  const [sentMessage, setSentMessage] = useState<string>("");
  const navigate = useNavigate();

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

  const handleMessageSend = async (fetchData, user, message, messages) => {
    if (!selectedTab) {
      return sendMessage(fetchData, user, message, messages);
    }
    const tabId = selectedTab.id;
    const chunks = await docsDb.searchDocumentChunks(tabId, message);
    if (chunks.length === 0) {
      return sendMessage(fetchData, user, message, messages);
    }
    let context = "";
    for (const chunk of chunks) {
      context += chunk;
    }
    context += message;
    return sendMessage(fetchData, user, context, messages);
  };

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
      } else {
        clearInterval(typewriter);
        setCurrentIndex(0);
        setBotResponse("");
      }
    }, 20);

    return () => clearInterval(typewriter);
  }, [botResponse, messages]);

  useEffect(() => {
    if (user) {
      fetchConversation();
    }
  }, [user]);

  useEffect(() => {
    const db = new DocumentsDB();
    setDocsDb(db);

    return () => {
      db.close();
    };
  }, []);

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
    const readResponse = async () => {
      try {
        if (!response) {
          return;
        }
        if (!db) {
          return;
        }
        if (response.url.indexOf("get_chat_title") !== -1) {
          response.json().then((data) => {
            setTitle(data.text);
            db.updateConversationTitle(chatId, data.text);
          });
          return;
        }
        const reader = response.body.getReader();
        let result = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          result += new TextDecoder().decode(value);
          setBotResponse(result);
        }
        db.appendMessagePair(chatId, { user: sentMessage, bot: result, type: 'message' });
      } catch (error) {
        console.error("Error reading response:", error);
      }
    };
    readResponse();
  }, [response]);

  useEffect(() => {
    if (!sentMessage) { return; }
    setMessage("");
    setMessages([...messages, { user: sentMessage, bot: "", type: 'message' }]);
    handleMessageSend(fetchData, user, sentMessage, messages);
  }, [sentMessage]);

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
        {/* {error && <div>Error: {error.message}</div>} */}
      </div>
      {error && (
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error.message}
        </Alert>
      )}
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
          <FileUpload chatId={chatId} setMessages={setMessages}/>
        </div>

        <button
          className="hover:cursor-pointer"
          onClick={async () => {
            setSentMessage(message);
            // setMessage("");
            // setMessages([...messages, { user: sentMessage, bot: "", type: 'message' }]);
            // handleMessageSend(fetchData, user, sentMessage, messages);
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
    </div>
  );
};

export default ChatPage;
