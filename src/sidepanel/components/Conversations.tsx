import React, { useState, useEffect } from "react";
import { ConversationsDB } from "../../db/db";
import { useUserData } from "../hooks/chromeStorageHooks";
import Conversation from "./Conversation";

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

    // Delete conversation
    await db.deleteConversation(id);

    // Update conversations state after deleting
    setConversations(conversations.filter((conv) => conv.id !== id));
  };

  return (
    <div className="shadow-2xl bg-gray-200 p-4 w-full rounded-t-3xl">
      <p className="mb-5 text-center text-lg font-bold">Past Conversations</p>
      {groupedConversations.map(([date, convGroup]) => (
        <div key={date}>
          <p className="text-gray-500 text-sm mb-2">{date}</p>
          {convGroup.map((conv) => (
            <Conversation
              key={conv.id}
              conversation={conv}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Conversations;
