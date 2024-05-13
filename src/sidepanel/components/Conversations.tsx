import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ConversationsDB } from "../../db/db";
import { useUserData } from "../hooks/chromeStorageHooks";
import Conversation from "./Conversation";
import { FiRefreshCcw } from "react-icons/fi";

const formatDate = (dateString: string) => {
  const messageDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  // for today
  if (
    messageDate.getDate() === today.getDate() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getFullYear() === today.getFullYear()
  ) {
    return "Today";
  }
  // for yesterday
  else if (
    messageDate.getDate() === yesterday.getDate() &&
    messageDate.getMonth() === yesterday.getMonth() &&
    messageDate.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  } else {
    // For other dates, format normally
    return messageDate.toLocaleDateString(undefined, options);
  }
};

const Conversations: React.FC = () => {
  const [db, setDb] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const user = useUserData();
  const [groupedConversations, setGroupedConversations] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    // Group conversations by date
    const grouped = conversations.reduce((groups, conv) => {
      const date = formatDate(conv.lastUpdated);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(conv);
      return groups;
    }, {});
    setGroupedConversations(Object.entries(grouped));
  }, [conversations]);

  const fetchConversations = async () => {
    if (!user) return;
    const dbInstance = new ConversationsDB(user.localId);
    const fetchedConversations = await dbInstance.getConversations();

    // Sort conversations by lastUpdated
    fetchedConversations.sort((a, b) => {
      const dateA = new Date(a.lastUpdated);
      const dateB = new Date(b.lastUpdated);
      return dateB.getTime() - dateA.getTime(); // Descending order
    });

    setDb(dbInstance);
    setConversations(fetchedConversations);
  };

  const handleDelete = async (id: string) => {
    if (!db) return;

    await db.deleteConversation(id);

    setConversations(conversations.filter((conv) => conv.id !== id));
  };

  const handleRename = async (id: string, title: string) => {
    if (!db) return;
    await db.updateConversationTitle(id, title)
    const conversations = await db.getConversations()
    setConversations(conversations);
  }

  const handleReset = (user) => {
    const db = new ConversationsDB(user.localId);
    db.reset();
    // const convoDiv = document.getElementById("convo");
    // if (convoDiv) {
    //   convoDiv.innerHTML = "";
    // }
  };

  const handleBackButton = () => {
    navigate(-1);
  }

  return (
    <div className="shadow-2xl bg-gray-200 p-4 w-full rounded-t-3xl">
      <button onClick={handleBackButton}>Back</button>
      <div className="flex flex-row items-center mb-5">
        <button
          onClick={() => handleReset(user)}
          className="mr-auto  text-red-300 hover:text-red-600"
        >
          <FiRefreshCcw className="w-5 h-5" />
        </button>
        <p className="text-center text-lg font-bold flex-grow">
          Past Conversations
        </p>
      </div>

      {groupedConversations.map(([date, convGroup]) => (
        <div id="convo" key={date}>
          <p className="text-gray-500 text-sm mb-2 ml-7">{date}</p>
          {convGroup.map((conv) => (
            <Conversation
              key={conv.id}
              conversation={conv}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Conversations;
