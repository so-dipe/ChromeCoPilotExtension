import React, { useEffect, useState } from "react";
import { useUserData } from "../hooks/chromeStorageHooks";
import { ConversationsDB } from "../../db/db";
import Conversation from "./Conversation";
import { useNavigate } from "react-router-dom";
import '../assets/recent.css';
import '../assets/fonts.css';

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
    }, [user])
    
    useEffect(() => {
        setLast5(conversations.slice(0, 5))
    }, [conversations])
    
    return (
        <div className="container-recent lexend-one">
            <div className='header'>
                <h2 className="heading lexend-six">Recent</h2>
                <button className="button" onClick={handleSeeMore}>
                    <span className="material-symbols-outlined">
                        arrow_forward_ios
                    </span>
                </button>
            </div>
            {(conversations.length > 0) ? last5.map((conversation, index) => (
                <Conversation
                    conversation={conversation}
                    onDelete={handleDelete}
                    onRename={handleRename}
                    key={index}
                />
            )) : <p>Nothing to see here</p>}
        </div>
    )
}

export default Recent;
