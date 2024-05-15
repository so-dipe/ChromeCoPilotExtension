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
    setFileUploaded: (status: boolean) => void;
}

const FileUpload: React.FC<Props> = ({chatId, setMessages, setFileUploaded}) => {
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
            const docId = chatId + new Date().getTime();
            docsDB.storeDocument(docId, filename, fileContent);
            db.appendFileToConversation(chatId, file, docId);
            db.addDocumentToConversation(chatId, docId);
            setMessages((prevMessages) => {
                return [...prevMessages, { type: 'file', file: file }];
            })
            setFileUploaded(true);
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