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
import OpenTabs from '../components/OpenTabs';
import FileUpload from '../components/FileUpload';
import "tailwindcss/tailwind.css";
import Back from '../components/Back'

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
    response: messagePair.bot
  });
  const url = `${serverUrl}/api/v1/messaging/get_chat_title?${params.toString()}`;
  await fetchData(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${user.idToken}`,
    }
  });
}



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
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<chrome.tabs.Tab | null>(null);
  const [docsDb, setDocsDb] = useState<any>(null);
  const [botResponse, setBotResponse] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [title, setTitle] = useState<string>('UNTITLED');
  const [titleGen, setTitleGen] = useState<boolean>(false);

  const fetchConversation = async () => {
    const db = new ConversationsDB(user.localId, 1);
    const conversation = await db.getConversation(chatId);
    setConversation(conversation);
    setMessages(conversation.messages);
    setTitle(conversation.title);
    if (conversation.title !== 'UNTITLED') {
      console.log('wtf');
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
    let context = '';
    for (const chunk of chunks) {
      context += chunk;
    }
    context += message;
    return sendMessage(fetchData, user, context, messages);
  };

  useEffect(() => {
    const typewriter = setInterval(() => {
      if (!botResponse) { return; }
      if (currentIndex < botResponse.length) {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessage = { ...updatedMessages[updatedMessages.length - 1] };
          const newMessage = { ...lastMessage, bot: lastMessage.bot + botResponse[currentIndex] };
          return [...updatedMessages.slice(0, updatedMessages.length - 1), newMessage];
        });
        setCurrentIndex(currentIndex + 1);
      } else {
        clearInterval(typewriter);
        setCurrentIndex(0);
        setBotResponse('');
      }
    }, 20);

    return () => clearInterval(typewriter);
  }, [botResponse, messages]);

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
    if (title === 'UNTITLED' && messages.length > 0 && botResponse && !titleGen) {
      const messagePair = {
        user: messages[0].user,
        bot: botResponse
      }
      generateConversationTitle(fetchData, user, messagePair);
      setTitleGen(true);
    }
  }, [messages])


  useEffect(() => {
    const readResponse = async () => {
      try {
        if (!response) { return; }
        if (!db) { return; }
        if (response.url.indexOf('get_chat_title') !== -1) {
          response.json().then((data) => {
            console.log(data.text);
            setTitle(data.text)
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
        db.appendMessagePair(chatId, { user: message, bot: result });
      } catch (error) {
        console.error("Error reading response:", error);
      } finally {
        console.log("Message Recieved or Not.")
      }
    };
    readResponse();
  }, [response]);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <Back />
        <OpenTabs onSelectTab={(tab) => setSelectedTab(tab)} />
        <FileUpload />

        {<Messages messages={messages} />}
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
            setMessages([...messages, { user: message, bot: '' }]);
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
