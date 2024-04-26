import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUserData, useToken, useRefreshToken } from '../hooks/chromeStorageHooks';
import serverUrl from '../../static/config';
import ConversationsDB from '../../db/db';
import { useFetchData } from '../hooks/fetchResponseHook';

const sendMessage = async (fetchData, user, message, conversation) => {
  const url = `${serverUrl}/api/v1/messaging/stream_response`;
  const response = await fetchData(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.idToken}`
    },
    body: JSON.stringify({
      message: message,
      history: conversation.messages,
    })
  });
  }

const renderMessage = async(message, sender) => {
  return (
    <div>
      {sender}: {message}
    </div>
  )
}

const renderMessages = async(messages) => {
  return (
    messages.array.foreach((element) => {
      renderMessage(element.user, "You");
      renderMessage(element.bot, "Chrome CoPilot")
    })
  )
}
  

const ChatPage: React.FC = () => {
  const user = useUserData();
  const chatId = useParams<{ chatId: string }>().chatId
  const { response, error, loading, fetchData} = useFetchData();
  const [conversation, setConversation] = useState<any>(null);

  const fetchConversation = async () => {
    const db = new ConversationsDB(user.localId, 1);
    const conversation = await db.getConversation(chatId);
    setConversation(conversation);
  }

  useEffect(() => {
    if (user) {
      fetchConversation()
    }
  }, [user])

  useEffect(() => {
    const readResponse = async () => {
      if (response && conversation) {
        const reader = response.body.getReader();
        let result = '';
        while (true) {
          const {done, value} = await reader.read();
          if (done) {
            break;
          }
          result += new TextDecoder().decode(value);
        }
        console.log(result);
      }
    }
  })


  return (
    <div>
      <h2>Chat Page</h2>
      <h3>{chatId}</h3>
      <input type="text" />
      <button onClick={() => sendMessage(fetchData, user, "hello", conversation)} disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
};

export default ChatPage;