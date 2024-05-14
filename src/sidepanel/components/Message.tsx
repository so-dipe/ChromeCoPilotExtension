import React, { useEffect, useState } from "react";
import { parse, MarkedOptions, Renderer } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import Avatar from "@mui/material/Avatar";
import { useUserData } from "../hooks/chromeStorageHooks";
import "tailwindcss/tailwind.css";
import Divider from "@mui/material/Divider";
import { FaCopy } from "react-icons/fa";
import Chip from '@mui/material/Chip';
import './../assets/fonts.css';
import '../assets/message.css';

const renderer = new Renderer();

renderer.code = (
  code: string,
  infoString: string = null,
  isEscaped: boolean = false
) => {
  if (!isEscaped) {
    code = DOMPurify.sanitize(code);
  }
  const highlightedCode = hljs.highlightAuto(code);
  const language = highlightedCode.language;

  const languageWithoutPrefix = language ? language.replace("lang-", "") : "";

  return `<div class="code-container"><div class="language-label">${languageWithoutPrefix}</div><pre><code class="hljs ${language}">${highlightedCode.value}</code></pre></div>`;
};

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
  const [htmlContent, setHtmlContent] = useState<string>("");
  const user = useUserData();

  useEffect(() => {
    const parsedContent = async () => {
      const htmlContent = await parse(content, options);
      setHtmlContent(htmlContent);
    };
    parsedContent();
  }, [content]);

  const order =
    sender === "bot"
      ? "rounded-tl-none rounded-tr-xl rounded-br-xl rounded-bl-xl ring-inset ring-transparent "
      : "    rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none ring-inset ring-transparent ";

  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        alert("Content copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };
  return (
    <div
      className={`flex-row justify-end ${sender === "bot" ? "ai" : "user"} m-1`}
    >
      {user && (
        <div className={`flex ${order}`}>
          <div
            className={`flex flex-col w-full min-w-[270px] text-gray-900 p-1 border-gray-200 ${order}`}
          >
            <div className="p-1 text-gray-900 nunito-one">
              {sender === "bot" ? (
                <Chip avatar={<Avatar>C</Avatar>} label="Chrome CoPilot" />
              ) : user.displayName ? (
                <Chip
                  avatar={<Avatar alt={user.displayName} src={user.photoUrl} />}
                  label={user.displayName}
                  variant="outlined"
                />
              ) : (
                <Chip avatar={<Avatar>Y</Avatar>} label="You" />
              )}
            </div>
            <div
              style={{ overflowX: "auto" }}
              className="text-sm font-normal p-1 text-gray-900"
            >
              <div
                className="message-content lexend-one"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(htmlContent),
                }}
              />
              {sender === "bot" ? (
                <div className="mt-2">
                  <FaCopy
                    onClick={handleCopyClick}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              ) : null}
            </div>
            <div className="border-t border-gray-300 my-2"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
