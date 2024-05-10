/**
 * Messages.tsx
 * A Component to render a list of message pairs (user, bot)
 */
import React from 'react'
import Message from './Message'
import Divider from '@mui/material/Divider';
// import Paper from '@mui/material/Paper';

interface MessagePair {
    user?: string;
    bot?: string;
    type: string;
    file: any;
}

interface Props {
    messages: MessagePair[];
}

const Messages: React.FC<Props> = ({ messages }) => {
    return (
        <div className='messages-container'>
            {messages.map((messagePair, index) => (
                (messagePair.type === 'message') ? (
                    <div key={index}>
                        <Message content={messagePair.user} sender="user" />
                        {messagePair.bot === '' ? <div></div> : <Message content={messagePair.bot} sender="bot" />}
                    </div>
                ) : (messagePair.type === 'file') ? (<div key={ index}>{messagePair.file.name} { messagePair.file.size / 1024}</div>) : null
            ))}
        </div>
    )
}

export default Messages;