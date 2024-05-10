import React, { useEffect, useState } from 'react'

interface Props { 
    document: any;
}

const Document: React.FC<Props> = ({ document }) => { 
    const [content, setContent] = useState<string>("");
    const [showContent, setShowContent] = useState<boolean>(false);
    useEffect(() => { 
        document.contentChunks.forEach((contentChunk) => { 
            console.log(contentChunk);
            setContent((prevContent) => prevContent + contentChunk);
        });
    }, []);

    const handleClick = () => {
        setShowContent(!showContent);
    }
    return (
        <div>
            <h1>{document.name}</h1>
            {
                showContent ? (
                    <button onClick={handleClick}>Hide</button>
                ) : (
                    <button onClick={handleClick}>Show</button>
                )
            }

            <div>
                {showContent && content}
            </div>
            
        </div>
    )
}

export default Document;