/**
 * Message.tsx
 * A component to conditionally render a Message for user or bot
 */
import React, {useEffect, useState} from 'react'
import { parse, MarkedOptions, Renderer } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'
import Avatar from '@mui/material/Avatar';
import { useUserData } from '../hooks/chromeStorageHooks';
import 'tailwindcss/tailwind.css';

const renderer = new Renderer();

renderer.code = (code: string, infoString: string = null, isEscaped: boolean=false) => { 
    if (!isEscaped) {
        code = DOMPurify.sanitize(code);
    }
    const highlightedCode = hljs.highlightAuto(code);
    const language = highlightedCode.language;

    const languageWithoutPrefix = language ? language.replace('lang-', '') : '';

    return `<pre><code class="hljs ${language}"><div>${languageWithoutPrefix}</div>${highlightedCode.value}</code></pre>`;
}

interface Props {
    sender: string;
    content: string;
}

const options: MarkedOptions = {
    renderer: renderer,
    gfm: true, // Enable GitHub Flavored Markdown
    breaks: true, // Enable automatic wrapping of long lines
};



const Message: React.FC<Props> = ({ sender, content }) => {
    const [htmlContent, setHtmlContent] = useState<string>('');
    const user = useUserData();

    useEffect(() => {
        const parsedContent = async () => { 
            const htmlContent = await parse(content, options);
            setHtmlContent(htmlContent);
        };
        parsedContent();
    }, [content]);
    return (
        <div className={`flex items-center ${sender === 'bot' ? 'ai' : 'user'}`}>
            {user && (
                <div className="mr-2">
                    {sender === 'bot' ? <Avatar className="w-3 h-3">CCP</Avatar> : (
                    user.photoUrl ? <Avatar className="w-3 h-3" src={user.photoUrl} /> : <Avatar className = "w-3 h-3">{user.fullName.charAt(0).toUpperCase()}</Avatar>
                    )}
                </div>
            )}
            <div className="message-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />
        </div>
    )
}

export default Message