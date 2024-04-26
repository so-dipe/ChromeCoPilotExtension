import React, { useState, useEffect } from 'react';

interface Props {
    chunk: string;
    stream: boolean;
}

const StreamMessage: React.FC<Props> = ({ chunk, stream }) => {
    const [previousChunks, setPreviousChunks] = useState<string[]>([]);

    useEffect(() => {
        setPreviousChunks(prevChunks => [...prevChunks, chunk]);
    }, [chunk]);

    useEffect(() => {
        console.log('changing stream to ', stream)
        if (!stream) {
            setPreviousChunks([]);
        }
    }, [stream]);

    return (
        stream && (
            <div>
            <div>ChromeCoPilot:</div>
            {/* Display all previous chunks */}
            {previousChunks.map((prevChunk, index) => (
                <div key={index}>{prevChunk}</div>
            ))}
        </div>
        )
    );
};

export default StreamMessage;
