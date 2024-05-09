import React, { useEffect, useState } from 'react'

interface Props { 
    document: any;
}

const Document: React.FC<Props> = ({ document }) => { 
    const [content, setContent] = useState<string>("");
    useEffect(() => { 
        document.contentChunks.forEach((contentChunk) => { 
            console.log(contentChunk);
            setContent((prevContent) => prevContent + contentChunk);
        });
    }, []);
    return (
        <div>
            <h1>{document.name}</h1>
            <p>{content}</p>
        </div>
    )
}

export default Document;