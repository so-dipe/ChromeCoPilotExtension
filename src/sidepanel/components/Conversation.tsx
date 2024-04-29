/**
 * Conversation.tsx
 * A component to render a single conversation
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'

interface ConversationProps {
    id: string,
    title: string,
    lastUpdated: string
}

interface Props {
    conversation: ConversationProps
}

const Conversation: React.FC<Props> = ({conversation}) => {
    const navigate = useNavigate();
    const handleConversationClick = () => {
        navigate(`/chat/${conversation.id}`);
        return [];
    }
    return (
        <div onClick={handleConversationClick}>
            <div className="conversation-title"><h3>{conversation.title}</h3></div>
            <div>{conversation.id} {conversation.lastUpdated}</div>
        </div>
    )
}

export default Conversation