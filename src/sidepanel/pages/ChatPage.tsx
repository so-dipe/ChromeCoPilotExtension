<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUserData } from "../hooks/chromeStorageHooks";
import serverUrl from "../../static/config";
import ConversationsDB from "../../db/db";
import { useFetchData } from "../hooks/fetchResponseHook";
import Messages from "../components/Messages";
import Message from "../components/Message";
import StreamMessage from "../components/StreamMessage";
import "tailwindcss/tailwind.css";
=======
/* This is the component that renders the Chat Page. It contains chat messages and a input to send messages to the
 * server. It works closely with the Messages and StreamMessage Components
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUserData } from '../hooks/chromeStorageHooks';
import serverUrl from '../../static/config';
import ConversationsDB from '../../db/db';
import { useFetchData } from '../hooks/fetchResponseHook';
import Messages from '../components/Messages';
import StreamMessage from '../components/StreamMessage'
import OpenTabs from '../components/OpenTabs';
import FileUpload from '../components/FileUpload';
>>>>>>> 000547b0e2d84ef825066edc8bc0e6e35c7cf017

const messagePairsToList = (messages) => {
  if (!Array.isArray(messages)) {
    throw new Error("Messages must be an array");
  }

  return messages.flatMap((messagePair) => [
    { role: "user", content: messagePair.user },
    { role: "model", content: messagePair.bot },
  ]);
};

<<<<<<< HEAD
const sendMessage = async (fetchData, user, message, conversation) => {
=======

const sendMessage = async (fetchData, user, message, messages) => {
>>>>>>> 000547b0e2d84ef825066edc8bc0e6e35c7cf017
  const url = `${serverUrl}/api/v1/messaging/stream_response`;
  await fetchData(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.idToken}`,
    },
    body: JSON.stringify({
      message: message,
<<<<<<< HEAD
      history: messagePairsToList(conversation.messages),
    }),
=======
      history: messagePairsToList(messages),
    })
>>>>>>> 000547b0e2d84ef825066edc8bc0e6e35c7cf017
  });
};

const ChatPage: React.FC = () => {
  const user = useUserData();
  const chatId = useParams<{ chatId: string }>().chatId;
  const { response, error, loading, fetchData } = useFetchData();
  const [conversation, setConversation] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
<<<<<<< HEAD
  const [message, setMessage] = useState<string>("");
  const [botMessage, setBotMessage] = useState<string>("");
  const [stream, setStream] = useState<boolean>(false);
  const [chunk, setChunk] = useState<string>("");
  const [previousChunk, setPreviousChunk] = useState<string>("");
=======
  const [message, setMessage] = useState<string>('');
  const [stream, setStream] = useState<boolean>(false);
  const [chunk, setChunk] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
>>>>>>> 000547b0e2d84ef825066edc8bc0e6e35c7cf017

  const fetchConversation = async () => {
    const db = new ConversationsDB(user.localId, 1);
    const conversation = await db.getConversation(chatId);
    console.log("chatPage", conversation);
    setConversation(conversation);
    setMessages(conversation.messages)
    setDb(db);
  };

  useEffect(() => {
    if (user) {
      fetchConversation();
    }
<<<<<<< HEAD
  }, [user, botMessage]);
=======
  }, [user])
>>>>>>> 000547b0e2d84ef825066edc8bc0e6e35c7cf017

  useEffect(() => {
    const readResponse = async () => {
      try {
        if (response && conversation) {
<<<<<<< HEAD
          setStream(true);
=======
          setStream(true); 
>>>>>>> 000547b0e2d84ef825066edc8bc0e6e35c7cf017
          const reader = response.body.getReader();
          let result = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            result += new TextDecoder().decode(value);
            setChunk(new TextDecoder().decode(value));
          }
<<<<<<< HEAD
          db.appendMessagePair(chatId, {
            user: message,
            bot: result,
=======
          db.appendMessagePair(chatId, { user: message, bot: result });
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[prevMessages.length - 1].bot = result;
            return updatedMessages;
>>>>>>> 000547b0e2d84ef825066edc8bc0e6e35c7cf017
          });
        }
      } catch (error) {
        console.error("Error reading response:", error);
      } finally {
        setStream(false);
      }
    };
    readResponse();
  }, [response]);

  return (
<<<<<<< HEAD
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-4">Chat Page</h2>
        <h3 className="text-sm font-semibold mb-2">{chatId}</h3>
        {conversation && <Messages messages={conversation.messages} />}
        {stream && <Message role="model" content={botMessage} />}{" "}
        {/*AI response */}
        {chunk && <StreamMessage chunk={chunk} stream={stream} />}
        {error && <div>Error: {error.message}</div>}
      </div>
      <div className="p-4 flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 py-2 px-4 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => {
            sendMessage(fetchData, user, message, conversation);
            setConversation({
              ...conversation,
              messages: [...conversation.messages, { user: message, bot: "" }],
            });
          }}
          disabled={loading}
          className="py-2 px-4 bg-blue-500 text-white rounded-r-md ml-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
=======
    <div>
      <h2>Chat Page</h2>
      <h3>{chatId}</h3>
      <OpenTabs />
      <FileUpload />
      {conversation && <Messages messages={messages} />}
      {<StreamMessage chunk={chunk} stream={stream}/>}
      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}/>
      <button onClick={() => {
        sendMessage(fetchData, user, message, messages);
        setMessages([...messages, { user: message, bot: '' }]);
      }} disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
      {error && <div>Error: {error.message}</div>}
>>>>>>> 000547b0e2d84ef825066edc8bc0e6e35c7cf017
    </div>
  );
};

export default ChatPage;
