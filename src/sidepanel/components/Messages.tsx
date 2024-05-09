/**
 * Messages.tsx
 * A Component to render a list of message pairs (user, bot)
 */
import React from 'react'
import Message from './Message'
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';

interface MessagePair {
    user: string;
    bot: string;
}

interface Props {
    messages: MessagePair[];
}

const Messages: React.FC<Props> = ({messages}) => {
    return (
        <div className='messages-container'>
            {messages.map((messagePair, index) => (
                // <Paper elevation={3} square={false}>
                <div key={index}>
                    <Message content={messagePair.user} sender="user" />
                    {messagePair.bot === '' ? <div></div> : <Message content={messagePair.bot} sender="bot" />}
                    <Divider />
                </div>
                // {/* </Paper> */}
            ))}
        </div>
    )
}

export default Messages;