import React from 'react'

interface Props {
    sender: string;
    content: string;
}

const Message: React.FC<Props> = ({sender, content}) => {
    return (
        <div className={sender === 'bot'? 'ai': 'user'}>
            {sender === 'bot'? 'Chrome CoPilot': 'You'}: {content || '...'}
        </div>
    )
}

export default Message