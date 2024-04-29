import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.mjs';

export const getFileType = (file: File) => {
    return file.name.split('.').pop();
};

export const readPdf = async (file: File) => {
    const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
    const numPages = pdf.numPages;
    let text = '';
    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map((item) => (item as any).str || '').join('');
        console.log(text);
    }
    return { numPages, text };
};

export const readPdfUrl = async (url: string) => {
    const pdf = await pdfjs.getDocument(url).promise;
    const numPages = pdf.numPages;
    let text = '';
    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map((item) => (item as any).str || '').join('');
        console.log(text);
    }
    return { numPages, text };
}

export const readAnyFile = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result;
            resolve(content as string);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsText(file);
    });
};

export const readDocx = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            resolve(result.value);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
};

export const readFile = async (file: File) => {
    const readableFileTypes = ['pdf', 'docx', 'doc', 'txt'];
    return new Promise<string>((resolve, reject) => {
        const fileType = getFileType(file);
        if (!fileType || !readableFileTypes.includes(fileType)) {
            reject(new Error('Unsupported file type'));
            return;
        };
        if (fileType === 'pdf') {
            readPdf(file).then((result) => {
                resolve(result.text);
            });
        } else if (fileType === 'docx' || fileType === 'doc') {
            readDocx(file).then((result) => {
                console.log(result);
                resolve(result);
            });
        } else {
            readAnyFile(file).then((result) => {
                resolve(result);
            });
        }
    });
};
