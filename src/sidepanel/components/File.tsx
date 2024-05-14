import React from 'react';
import "tailwindcss/tailwind.css";
import '../assets/file.css';

interface Props {
    file: any;
}

const File: React.FC<Props> = ({ file }) => {
    const fileSize = file.size;
    let fileSizeString;

    if (fileSize >= 1024 * 1024) {
        fileSizeString = (fileSize / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
        fileSizeString = (fileSize / 1024).toFixed(2) + ' KB';
    }
    return (
        <div className="file-container">
            <span className="material-symbols-outlined">
                draft
            </span>
            <div className="file-details">
                <h3>{file.name}</h3>
                <p>{fileSizeString}</p>
            </div>
            <div className="border-t border-gray-300 my-2"></div>
        </div>
    )
}

export default File