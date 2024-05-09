import React, {useState, useEffect} from 'react';
import { useUserData } from '../hooks/chromeStorageHooks';
import { DocumentsDB, ConversationsDB } from '../../db/db';
import Document from './Document';

interface Props { 
    chatId: string;
}

const ChatDocuments: React.FC<Props> = ({chatId}) => { 
    const user = useUserData();
    const [docsDb, setDocsDb] = useState<any>(new DocumentsDB());
    const [db, setDb] = useState<ConversationsDB | null>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [docsIds, setDocsIds] = useState<number[]>([]);

    useEffect(() => {
        if (user) {
            const db = new ConversationsDB(user.localId);
            setDb(db);
        }
    }, [user])

    useEffect(() => {
        if (db) {
            db.getConversation(chatId).then((conversation) => {
                console.log("Conversation", conversation)
                setDocsIds(conversation.docsId);
            });
        }
    }, [db])

    useEffect(() => {
        docsIds && docsIds.forEach((docId) => {
            docId = parseInt(docId.toString());
            docsDb.getDocument(docId).then((document) => {
                setDocuments((prevDocs) => [...prevDocs, document]);
            });
        });
    }, [docsIds])


    return (
        <div>
            <h1>Chat Contexts</h1>
            {documents.map((document) => (
                <Document document={document} />
            ))}
        </div>
    )
}

export default ChatDocuments;