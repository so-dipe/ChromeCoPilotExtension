import React from 'react';
import { readFile } from '../utils/file_reader';

const FileUpload: React.FC = () => {
    const [fileContent, setFileContent] = React.useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const content = await readFile(files[0]);
            setFileContent(content);
        }
    };

    return (
        <div>
            <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleFileChange} />
            {fileContent && <pre>{fileContent}</pre>}
        </div>
    );
}

export default FileUpload;