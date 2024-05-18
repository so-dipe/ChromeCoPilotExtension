import React, { useEffect, useState } from "react";
import { useFetchData } from "../hooks/fetchResponseHook";
import 'tailwindcss/tailwind.css';
import { useLLMProvider, useUserData } from "../hooks/chromeStorageHooks";
import { generateConversationTitle } from "../utils/send_message_utils";
import { generateTitle } from "../utils/basic_llm_router";
import { ConversationsDB } from "../../db/db";

const handleTitle = (text, chatId, db, setTitle) => {
    const words = text.split(/\s+/);
    if (words.length > 5) {
        const title = words.slice(0, 5).join(" ");
        setTitle(title);
        db.updateConversationTitle(chatId, title);
    } else {
        setTitle(text);
        db.updateConversationTitle(chatId, text);
    }
};


interface Props {
    conversation: any;
    message: string;
    botResponse?: string;

}

const Title: React.FC<Props> = ({conversation, message, botResponse}) => {
    const [title, setTitle] = useState<string>(conversation.title);
    const [db, setDb] = useState<any>(null);
    const { response, error, loading, fetchData } = useFetchData();
    const user = useUserData();
    const llmProvider = useLLMProvider();

    useEffect(() => {
        if (!user) return;
        const db = new ConversationsDB(user.localId);
        setDb(db);
    }, [user])

    useEffect(() => {
        if (!user) return;
        if (title !== 'UNTITLED') return;
        if (message === '') return;
        const messagePair = {
            user: message,
            bot: botResponse
        }
        if (!llmProvider) {
            generateConversationTitle(fetchData, user, messagePair)
        } else if (llmProvider.version.indexOf('gemini') !== -1) {
            generateTitle(fetchData, messagePair, llmProvider);
        }
    }, [botResponse])

    useEffect(() => {
        if (!response) return;
        if (response.url.indexOf('get_chat_title') !== -1) {
            response.json().then(data => handleTitle(data.text, conversation.id, db, setTitle))
            return;
        } else if (response.url.indexOf(':generateContent?key=') !== -1) {
            response.json().then(data => {
                console.log(data)
                const text = data.candidates[0].content.parts[0].text
                handleTitle(text, conversation.id, db, setTitle);
            })
        }
    }, [response])

    return (
        <div>
            <h2 className="text-lg font-semibold ml-4 self-center">{title}</h2>
        </div>
    )
}

export default Title;