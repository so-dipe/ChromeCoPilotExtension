/**
 * StreamMessage.tsx
 * This component takes the message chunks recieved from the server
 * and creates a typewriter effect by displaying the message character by character
 */
import React, { useState, useEffect } from 'react';

interface Props {
    chunk: string;
    stream: boolean;
    onStream?: (isStreaming: boolean) => void;
}

const StreamMessage: React.FC<Props> = ({ chunk, stream, onStream }) => {
    const [streamChunks, setStreamChunks] = useState<string>('');
    const [displayedText, setDisplayedText] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    useEffect(() => {
        setStreamChunks(streamChunks + chunk);
    }, [chunk]);

    useEffect(() => {
        if (!isStreaming) {
          setStreamChunks('');
        }
    }, [stream, isStreaming]);

    useEffect(() => {
      setIsStreaming(true);
      onStream && onStream(true);
        const typewriter = setInterval(() => {
          if (currentIndex < streamChunks.length) {
            setDisplayedText((prevText) => prevText + streamChunks[currentIndex]);
            setCurrentIndex(currentIndex + 1);
          } else {
            clearInterval(typewriter);
            setIsStreaming(false);
            setDisplayedText('');
            onStream && onStream(false);
          }
        }, 20);

        return () => clearInterval(typewriter);
      }, [streamChunks, currentIndex]);

    return (
        isStreaming && (
            <div>
            <div>ChromeCoPilot:</div>
            {displayedText}
        </div>
        )
    );
};

export default StreamMessage;
