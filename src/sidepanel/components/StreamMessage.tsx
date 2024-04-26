import React, { useState, useEffect } from 'react';

interface Props {
    chunk: string;
    stream: boolean;
}

const StreamMessage: React.FC<Props> = ({ chunk, stream }) => {
    const [previousChunks, setPreviousChunks] = useState<string>('');
    const [displayedText, setDisplayedText] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    useEffect(() => {
        setPreviousChunks(previousChunks + chunk);
    }, [chunk]);

    useEffect(() => {
        console.log('changing stream to ', stream)
        if (!stream) {
            setPreviousChunks('');
        }
    }, [stream]);

    useEffect(() => {
        setIsStreaming(true);
        const typewriter = setInterval(() => {
          if (currentIndex < previousChunks.length) {
            setDisplayedText((prevText) => prevText + previousChunks[currentIndex]);
            setCurrentIndex(currentIndex + 1);
          } else {
            clearInterval(typewriter);
            setIsStreaming(false);
          }
        }, 5);
      
        return () => clearInterval(typewriter);
      }, [previousChunks, currentIndex]);

    return (
        stream && (
            <div>
            <div>ChromeCoPilot:</div>
            {displayedText}
        </div>
        )
    );
};

export default StreamMessage;
