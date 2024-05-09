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

    // Update  conversations state after the deleting
    setConversations(conversations.filter((conv) => conv.id !== id));
  };

  return (
    <div className="shadow-2xl bg-gray-200 h-[55%] p-4 w-full   rounded-t-3xl">
      <p className="mb-5 text-center text-lg font-bold">Past Conversations</p>
      {conversations.map((conv) => (
        <Conversation
          key={conv.id}
          conversation={conv}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default Conversations;
