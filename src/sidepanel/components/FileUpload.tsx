import React from 'react';

const FileUpload: React.FC = () => {
    const [fileContent, setFileContent] = React.useState<string | null>(null);

    const readFile = async (file: File) => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target) {
                    resolve(event.target.result as string);
                }
            };
            reader.onerror = (event) => {
                reject(event);
            };
            reader.readAsText(file);
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const content = await readFile(files[0]);
            setFileContent(content);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            {fileContent && <pre>{fileContent}</pre>}
        </div>
    );
}

export default FileUpload;