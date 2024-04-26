import React from 'react'
import Message from './Message'

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
                <div key={index}>
                    <Message content={messagePair.user} sender="user" />
                    {messagePair.bot === ''? <div></div> :<Message content={messagePair.bot} sender="bot" />}
                </div>
            ))}
        </div>
    )
}

export default Messages;