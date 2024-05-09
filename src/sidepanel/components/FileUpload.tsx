import React, { useEffect, useState } from 'react';
import { readFile } from '../utils/file_reader';
import { ConversationsDB, DocumentsDB } from '../../db/db';
import { useUserData } from '../hooks/chromeStorageHooks';
import AttachFileIcon from '@mui/icons-material/AttachFile';

interface Props {
    chatId: string;
}

const FileUpload: React.FC<Props> = ({chatId}) => {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const [docsDB, setDocsDB] = useState<DocumentsDB | null>(new DocumentsDB());
    const [db, setDb] = useState<ConversationsDB | null>(null);
    const user = useUserData();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
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
            db && db.addDocumentToConversation(chatId, docsId);
        }
    }, [fileContent]);

    return (
        <label htmlFor="file-input" className="relative cursor-pointer">
            <input
                id="file-input"
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0"
            />
            <AttachFileIcon className="text-gray-600 w-8 h-8" />
        </label>
    );
}

export default FileUpload;