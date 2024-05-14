import React, { useEffect, useState } from 'react';
import { readFile } from '../utils/file_reader';
import { ConversationsDB, DocumentsDB } from '../../db/db';
import { useUserData } from '../hooks/chromeStorageHooks';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Messages from './Messages';
import '../assets/file-upload.css';

interface Props {
    chatId: string;
    setMessages: any;
}

const FileUpload: React.FC<Props> = ({chatId, setMessages}) => {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const [file, setFile] = useState<any>(null);
    const docsDB = new DocumentsDB();
    const [db, setDb] = useState<ConversationsDB | null>(null);
    const user = useUserData();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setFile(files[0]);
            const content = await readFile(files[0]);
            setFileContent(content);
            setFilename(files[0].name);
        }
    };

    useEffect(() => { 
        if (user) {
            const db = new ConversationsDB(user.localId);
            setDb(db);
        }
    }, [user]);

    useEffect(() => { 
        if (fileContent) {
            const docsId = chatId + new Date().getTime();
            docsDB.storeDocument(docsId, filename, fileContent);
            db && db.appendFile(chatId, file, docsId);
            db && db.addDocumentToConversation(chatId, docsId);
            setMessages((prevMessages) => {
                return [...prevMessages, { type: 'file', file: file }];
            })
        }
    }, [fileContent]);

    return (
        <label htmlFor="file-input" className='file-upload-button'>
            <input
                id="file-input"
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
            />
            <span className="material-symbols-outlined">
                attach_file
            </span>
        </label>
    );
}

export default FileUpload;