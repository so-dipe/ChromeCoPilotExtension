import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUserData } from '../hooks/chromeStorageHooks';
import { DocumentsDB, ConversationsDB } from '../../db/db';
import Document from '../components/Document';

const ContextsPage = () => {
    const user = useUserData();
    const { chatId } = useParams<{ chatId: string }>();
    const docsDB = new DocumentsDB();
    const [db, setDb] = useState<any>(null);
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (user) {
            const db = new ConversationsDB(user.localId);
            setDb(db);
        }
    }, [user])

    useEffect(() => {
        if (!db || !chatId) {
            return;
        }

        setLoading(true);

        db.getConversation(chatId).then((conv) => {
            const promises = conv.docsId.map((id) =>
                docsDB.getDocument(id).catch((error) => {
                    console.log(id);
                    if (error === `Document with id: ${id} not found`) {
                        db.removeDocumentFromConversation(chatId, id);
                    }
                    return null; // Return null if document is not found
                })
            );

            Promise.all(promises).then((documents) => {
                setDocs(documents.filter(Boolean)); // Filter out null values
                setLoading(false);
            }).catch((error) => {
                console.error('Error fetching documents:', error);
                setLoading(false);
            });
        }).catch((error) => {
            console.error('Error fetching conversation:', error);
            setLoading(false);
        });
    }, [db, chatId])

    return (
        <div>
            <h1>Contexts</h1>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    {docs.map((doc, index) => (
                        <Document document={doc} key={index} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default ContextsPage;
