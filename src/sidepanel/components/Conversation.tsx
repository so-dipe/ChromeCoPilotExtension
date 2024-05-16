/**
 * Conversation.tsx
 * A component to render a single conversation
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Backdrop from '@mui/material/Backdrop';

const RenameCard = (open, setOpen, title, setTitle, onRename, conversationId) => {
  const handleChange = (e) => {
    if (!e.target.value) return; 
    setTitle(e.target.value);
  }
  const handleClose = () => { 
    setOpen(false);
  };
  const handleSave = () => {
    onRename(conversationId, title)
    setOpen(false);
  }

  return (
    <React.Fragment>
      <Backdrop sx={{zIndex: 1 }} open={open}>
        <div>
          <button onClick={handleClose}>Close</button>
          <input type="text" placeholder="Enter Title" value={title} onChange={handleChange}/>
          <button onClick={handleSave}>Save</button>
        </div>
      </Backdrop>
    </React.Fragment>
  )
}

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
  const [bopen, setBOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState(conversation.title);

  const handleConversationClick = () => {
    navigate(`/chat/${conversation.id}`);
  };

  const handleDeleteClick = (id: string) => {
    onDelete(id);
    setAnchorEl(null);
  };

  const handleMoreClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setAnchorEl(null);
  };

  const handleRenameClick = () => { 
    setBOpen(true);
    // onRename(id, title);
    setAnchorEl(null);
  };

  return (
    <div id="convo" className="flex flex-col w-full items-center">
      <div className="conversation-title">
        <div className="hover:bg-gray-200 cursor-pointer flex flex-row justify-between items-center mb-2 py-2 px-5 hover:shadow-lg w-64 rounded-md font-bold text-blue-700 hover:text-green-600 border border-blue-700">
          <h3 onClick={handleConversationClick}>{conversation.title}</h3>
          <button onClick={handleMoreClick}>
            <span className="material-symbols-outlined">
              more_vert
            </span>
          </button>
          <Menu open={open} anchorEl={anchorEl} onClose={handleMoreClose}>
            <MenuItem onClick={handleRenameClick}>
              <span className="material-symbols-outlined">
                edit
              </span>
              Rename
            </MenuItem>
            <MenuItem onClick={() => handleDeleteClick(conversation.id)}>
              <span className="material-symbols-outlined">
                delete
              </span>
              Delete
            </MenuItem>
          </Menu>
        </div>
        {RenameCard(bopen, setBOpen, newTitle, setNewTitle, onRename, conversation.id)}
      </div>
    </div>
  );
};

export default Conversation;

{
  /* <div>{conversation.id}</div> */
}
