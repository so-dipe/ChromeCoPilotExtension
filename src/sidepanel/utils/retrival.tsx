import { DocumentsDB } from "../../db/db";

const db = new DocumentsDB();

export const retrieve_contexts = (docsId: string[], message: string) => {
    const promises = docsId.map((id) =>
        db.searchDocumentChunks(id, message)
            .then((chunks) => {
                console.log("chunks", chunks)
                if (chunks.length === 0) { return null; }
                let context = '';
                for (const chunk of chunks) {
                    context += chunk;
                }
                console.log("retrival", context);
                return context;
            })
            .catch((error) => {
            if (error === `Document with id: ${id} not found`) {
                console.log(`Document with id: ${id} not found`);
                db.deleteDocument(id);
            }
            return null;
        })
    );

    return Promise.all(promises).then((documents) => {
        return documents.filter(Boolean);
    }).catch((error) => {
        console.error('Error fetching documents:', error);
        return [];
    });
}