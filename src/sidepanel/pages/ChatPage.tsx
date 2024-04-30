/* This is the component that renders the Chat Page. It contains chat messages and a input to send messages to the
 * server. It works closely with the Messages and StreamMessage Components
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUserData } from '../hooks/chromeStorageHooks';
import serverUrl from '../../static/config';
import { ConversationsDB, DocumentsDB } from '../../db/db';
import { useFetchData } from '../hooks/fetchResponseHook';
import Messages from '../components/Messages';
import StreamMessage from '../components/StreamMessage'
import OpenTabs from '../components/OpenTabs';
import FileUpload from '../components/FileUpload';
import "tailwindcss/tailwind.css";

const messagePairsToList = (messages) => {
  if (!Array.isArray(messages)) {
    throw new Error("Messages must be an array");
  }

  return messages.flatMap((messagePair) => [
    { role: "user", content: messagePair.user },
    { role: "model", content: messagePair.bot },
  ]);
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
    })
  });
};

const ChatPage: React.FC = () => {
  const user = useUserData();
  const chatId = useParams<{ chatId: string }>().chatId;
  const { response, error, loading, fetchData } = useFetchData();
  const [conversation, setConversation] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const [message, setMessage] = useState<string>('');
  const [stream, setStream] = useState<boolean>(false);
  const [chunk, setChunk] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<chrome.tabs.Tab | null>(null);
  const [docsDb, setDocsDb] = useState<any>(null);

  const fetchConversation = async () => {
    const db = new ConversationsDB(user.localId, 1);
    const conversation = await db.getConversation(chatId);
    setConversation(conversation);
    setMessages(conversation.messages)
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
    console.log("searched chunks", chunks)
    let context = '';
    for (const chunk of chunks) {
      context += chunk.content;
    }
    context += message;
    return sendMessage(fetchData, user, context, messages);
  };

  useEffect(() => {
    if (user) {
      fetchConversation();
    }
  }, [user])

  useEffect(() => { 
    const db = new DocumentsDB();
    setDocsDb(db);

    return () => { db.close()}
  }, []);


  useEffect(() => {
    const readResponse = async () => {
      try {
        if (response && conversation) {
          setStream(true); 
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
          db.appendMessagePair(chatId, { user: message, bot: result });
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[prevMessages.length - 1].bot = result;
            return updatedMessages;
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
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-4">Chat Page</h2>
        <h3 className="text-sm font-semibold mb-2">{chatId}</h3>
        <OpenTabs onSelectTab={(tab) => setSelectedTab(tab)} />
        <FileUpload />

        {conversation && <Messages messages={conversation.messages} />}
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
            handleMessageSend(fetchData, user, message, messages);
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
    </div>
  );
};

export default ChatPage;
