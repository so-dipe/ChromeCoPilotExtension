/**
 * Message.tsx
 * A component to conditionally render a Message for user or bot
 */
import React, {useEffect, useState} from 'react'
import { parse, MarkedOptions, Renderer } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'

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

    useEffect(() => {
        const parsedContent = async () => { 
            const htmlContent = await parse(content, options);
            setHtmlContent(htmlContent);
        };
        parsedContent();
    }, [content]);
    return (
        <div className={sender === 'bot'? 'ai': 'user'}>
            <span className="message-sender">{sender === 'bot' ? 'Chrome CoPilot' : 'You'}:</span>
            <div className="message-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />
        </div>
    )
}

export default Message