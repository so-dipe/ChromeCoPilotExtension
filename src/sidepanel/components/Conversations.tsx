/**
 * Conversations.tsx
 * A component to sort and render a list of conversations, used by Profile Page
 */
import React, { useState, useEffect } from "react";
import { ConversationsDB } from "../../db/db";
import { useUserData } from "../hooks/chromeStorageHooks";
import Conversation from "./Conversation";

const Conversations: React.FC = () => {
  const [db, setDb] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const user = useUserData();

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    const dbInstance = new ConversationsDB(user.localId, 1);
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

  return (
    <div className="shadow-2xl bg-gray-200 h-[40%] p-6 w-full flex flex-col items-center justify-center  rounded-t-3xl">
      {conversations.map((conv, index) => (
        <Conversation key={index} conversation={conv} />
      ))}
    </div>
  );
};

export default Conversations;
