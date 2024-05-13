import React, { useEffect, useState } from "react";
import { useUserData } from "../hooks/chromeStorageHooks";
import { ConversationsDB } from "../../db/db";
import { FaArrowRight } from "react-icons/fa";
import Conversation from "./Conversation";
import { useNavigate } from "react-router-dom";

const fetchConversations = async (user, setDb, setConversations) => {
  const dbInstance = new ConversationsDB(user.localId);
  const fetchedConversations = await dbInstance.getConversations();

  fetchedConversations.sort((a, b) => {
    const dateA = new Date(a.lastUpdated);
    const dateB = new Date(b.lastUpdated);
    return dateB.getTime() - dateA.getTime(); // Descending order
  });

  setDb(dbInstance);
  setConversations(fetchedConversations);
};

const Recent = () => {
  const [db, setDb] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const user = useUserData();
  const [last5, setLast5] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (!db) return;
    await db.deleteConversation(id);
    setConversations(conversations.filter((conv) => conv.id !== id));
  };

  const handleRename = async (id: string, title: string) => {
    if (!db) return;
    await db.updateConversationTitle(id, title);
    const conversations = await db.getConversations();
    setConversations(conversations);
  };

  const handleSeeMore = () => {
    navigate("/conversations");
  };

  useEffect(() => {
    if (!user) return;
    fetchConversations(user, setDb, setConversations);
  }, [user]);

  useEffect(() => {
    setLast5(conversations.slice(0, 5));
  }, [conversations]);

  return (
    <div>
      {last5.map((conversation) => {
        return (
          <Conversation
            conversation={conversation}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        );
      })}
      <div
        onClick={handleSeeMore}
        className="flex flex-row p-5 cursor-pointer text-green-700 hover:text-blue-700 items-center justify-start"
      >
        <button className=" mr-3">See all</button>
        <FaArrowRight className="" />
      </div>
    </div>
  );
};

export default Recent;
