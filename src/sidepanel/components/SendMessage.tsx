import React, {useEffect, useState} from 'react'
import FileUpload from "../components/FileUpload";
import OpenTabs from "../components/OpenTabs";
import { CircularProgress } from "@mui/material";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import { useFetchData } from "../hooks/fetchResponseHook";
import { sendMessage, filterMessages } from '../utils/send_message_utils';
import { useLLMProvider, useUserData } from "../hooks/chromeStorageHooks";
import { generateWithAPI } from '../utils/basic_llm_router';
import { retrieve_contexts } from '../utils/retrival';
import { ConversationsDB } from "../../db/db";
import '../assets/send_message.css';

interface SendMessageProps { 
    chatId: string;
    messages: any[];
    setMessages: React.Dispatch<React.SetStateAction<any[]>>;
    setResponse: React.Dispatch<React.SetStateAction<any>>;
    setError: React.Dispatch<React.SetStateAction<Error>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    onSendMessage: (message: string) => void;
}

const get_contexts = async (docsIds, selectedTab, message) => {
    if (selectedTab) docsIds.push(selectedTab.id);
    const contexts = await retrieve_contexts(docsIds, message);
    let context = "";
    contexts.forEach((cxt) => { context += cxt + " "});
    return context;
}

const SendMessage: React.FC<SendMessageProps> = ({chatId, messages, setMessages, setResponse, setError, setLoading, onSendMessage}) => {
    const [message, setMessage] = useState("");
    const [selectedTab, setSelectedTab] = useState<chrome.tabs.Tab | null>(null);
    const [sentMessage, setSentMessage] = useState("");
    const [db, setDb] = useState<any>(null);
    const [docsId, setDocsId] = useState<string[]>([]); 
    const [fileUploaded, setFileUploaded] = useState<boolean>(false);
    const { response, error, loading, fetchData } = useFetchData();
    const user = useUserData();
    const llmProvider = useLLMProvider();

    useEffect(() => { 
        if (user) {
            const db = new ConversationsDB(user.localId);
            setDb(db);
            db.getConversation(chatId).then((conversation) => { 
                if (conversation) {
                    setDocsId(conversation.docsId);
                }
            });
        }
    }, [user]);

    useEffect(() => {
        if (!db) return;
        db.getConversation(chatId).then((conversation) => {
            if (conversation) {
                setDocsId(conversation.docsId);
            }
            setFileUploaded(false);
        });
        
    }, [fileUploaded])

    useEffect(() => { 
        if (!sentMessage) return;
        onSendMessage(sentMessage);
        console.log("three men walk into a bar", docsId, selectedTab, sentMessage)
        setMessage('');
        setMessages([...messages, { user: sentMessage, bot: "", type: 'message' }]);
        get_contexts(docsId, selectedTab, sentMessage).then((context) => {
            console.log("retrieved contexts", context);
            if (llmProvider) {
                generateWithAPI(fetchData, filterMessages(messages), context + sentMessage, llmProvider);
            } else {
                sendMessage(fetchData, user, context + sentMessage, filterMessages(messages));
            }
        });
    }, [sentMessage]);

    useEffect(() => {   
        setResponse(response);
    }, [response]);

    useEffect(() => {
        setError(error);
    }, [error]);

    useEffect(() => {
        setLoading(loading);
    }, [loading]);

    const handleMessageInput = (e: React.SyntheticEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        setMessage(target.innerText);
    };

    return (
        <div>
            {!selectedTab && <OpenTabs chatId={chatId} onSelectTab={(tab) => setSelectedTab(tab)} />}
            {selectedTab && (
                <div className="selected-tab">
                    <p>{selectedTab.title}</p>
                    <button onClick={() => setSelectedTab(null)}>
                        <span className="material-symbols-outlined">
                            remove
                        </span>
                    </button>
                </div>
            )}
            <div className="container-send-message">
                <TextareaAutosize
                    className="message-input resize-none"
                    aria-label="empty textarea"
                    placeholder="Chat with Chrome CoPilot..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxRows={10}
                />
                <div>
                    <FileUpload chatId={chatId} setMessages={setMessages} setFileUploaded={setFileUploaded}/>
                    <button
                        className="hover:cursor-pointer"
                        onClick={async () => {
                            setSentMessage(message);
                        }}
                        disabled={loading}
                    >
                        {message ? (
                            <span className="material-symbols-outlined">send</span>
                        ) : loading ? (
                            <CircularProgress color="secondary" size={25} />
                        ) : null}
                    </button>
                </div>
            </div>
        </div>
  )
}

export default SendMessage

// p-1 w-full justify-between flex items-center

// w-[90%] text-sm font-normal font-sans leading-normal p-2 rounded-xl rounded-br-none shadow-lg shadow-slate-100 dark:shadow-slate-900 focus:shadow-outline-purple dark:focus:shadow-outline-purple focus:shadow-lg border border-solid border-slate-300 hover:border-purple-500 dark:hover:border-purple-500 focus:border-purple-500 dark:focus:border-purple-500 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus-visible:outline-0 box-border resize-none max-h-48