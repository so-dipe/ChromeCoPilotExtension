/**
 * Conversation.tsx
 * A component to render a single conversation
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { RiPushpin2Line, RiDeleteBinLine, RiEdit2Line } from "react-icons/ri";

interface ConversationProps {
  id: string;
  title: string;
  lastUpdated: string;
}

interface Props {
  conversation: ConversationProps;
  onDelete: (id: string) => void;
}

const Conversation: React.FC<Props> = ({ conversation, onDelete }) => {
  const navigate = useNavigate();

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

    //  for today
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

  const handleConversationClick = () => {
    navigate(`/chat/${conversation.id}`);
  };

  const handleDeleteClick = (id: string) => {
    onDelete(id);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="conversation-title">
        <p className="p-2 font-bold">{formatDate(conversation.lastUpdated)}</p>
        <div className="hover:bg-gray-200 cursor-pointer flex flex-row justify-between items-center mb-2 py-2 px-5 hover:shadow-lg w-64 rounded-xl font-bold text-green-500 hover:text-green-600 border border-green-500">
          <h3 onClick={handleConversationClick}>{conversation.title}</h3>
          <div className="flex flex-row">
            <div className="transform hover:scale-105 hover:-translate-y-1">
              <RiEdit2Line size={18} color="green" />
            </div>
            <div
              className="px-3 transform hover:scale-105 hover:-translate-y-1"
              onClick={() => handleDeleteClick(conversation.id)}
            >
              <RiDeleteBinLine size={18} color="red" />
            </div>
            <div className="transform hover:scale-105 hover:-translate-y-1">
              <RiPushpin2Line size={18} color="blue" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversation;

{
  /* <div>{conversation.id}</div> */
}
