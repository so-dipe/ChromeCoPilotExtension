/**
 * Conversation.tsx
 * A component to render a single conversation
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { RiPushpin2Line, RiDeleteBinLine, RiEdit2Line } from "react-icons/ri";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { More } from "@mui/icons-material";

interface ConversationProps {
  id: string;
  title: string;
  lastUpdated: string;
}

interface Props {
  conversation: ConversationProps;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

const Conversation: React.FC<Props> = ({
  conversation,
  onDelete,
  onRename,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleConversationClick = () => {
    navigate(`/chat/${conversation.id}`);
  };

  const handleDeleteClick = (id: string) => {
    onDelete(id);
  };

  const handleMoreClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMoreClose = () => {
    setAnchorEl(null);
  };

  return (
    <div id="convo" className="flex flex-col w-full items-center">
      <div className="conversation-title">
        <div className="hover:bg-gray-200 cursor-pointer flex flex-row justify-between items-center mb-2 py-2 px-5 hover:shadow-lg w-64 rounded-md font-bold text-blue-700 hover:text-green-600 border border-blue-700">
          <h3 onClick={handleConversationClick}>{conversation.title}</h3>
          <button onClick={handleMoreClick}>
            <MoreVertIcon />
          </button>
          <Menu open={open} anchorEl={anchorEl} onClose={handleMoreClose}>
            <MenuItem>Rename</MenuItem>
            <MenuItem onClick={() => handleDeleteClick(conversation.id)}>
              Delete
            </MenuItem>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default Conversation;

{
  /* <div>{conversation.id}</div> */
}
