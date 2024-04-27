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

const messagePairsToList = (messages) => {
  if (!Array.isArray(messages)) {
    throw new Error('Messages must be an array');
  }

  return messages.flatMap((messagePair) => [
    { role: 'user', content: messagePair.user },
    { role: 'model', content: messagePair.bot }
  ]);
};


const sendMessage = async (fetchData, user, message, messages) => {
  const url = `${serverUrl}/api/v1/messaging/stream_response`;
  await fetchData(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.idToken}`
    },
    body: JSON.stringify({
      message: message,
      history: messagePairsToList(messages),
    })
  });
  }  

const ChatPage: React.FC = () => {
  const user = useUserData();
  const chatId = useParams<{ chatId: string }>().chatId
  const { response, error, loading, fetchData} = useFetchData();
  const [conversation, setConversation] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const [message, setMessage] = useState<string>('');
  const [stream, setStream] = useState<boolean>(false);
  const [chunk, setChunk] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);

  const fetchConversation = async () => {
    const db = new ConversationsDB(user.localId, 1);
    const conversation = await db.getConversation(chatId);
    console.log("chatPage", conversation);
    setConversation(conversation);
    setMessages(conversation.messages)
    setDb(db);
  }

  useEffect(() => {
    if (user) {
      fetchConversation();
    }
  }, [user])

  useEffect(() => {
    const readResponse = async () => {
      try {
        if (response && conversation) {
          setStream(true); 
          const reader = response.body.getReader();
          let result = '';
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
        console.error('Error reading response:', error);
      } finally {
        setStream(false);
      }
    };
    readResponse();
  }, [response]);


  return (
    <div>
      <h2>Chat Page</h2>
      <h3>{chatId}</h3>
      {conversation && <Messages messages={messages} />}
      {<StreamMessage chunk={chunk} stream={stream}/>}
      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}/>
      <button onClick={() => {
        sendMessage(fetchData, user, message, messages);
        setMessages([...messages, { user: message, bot: '' }]);
      }} disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
};

export default ChatPage;