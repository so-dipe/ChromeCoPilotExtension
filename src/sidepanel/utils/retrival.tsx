import { DocumentsDB } from "../../db/db";

const db = new DocumentsDB();

export const retrieve_contexts = (docsId: any[], message: string) => {
    const promises = docsId.map((id) =>
        db.searchDocumentChunks(id, message)
            .then((chunks) => {
                if (chunks.length === 0) { return null; }
                let context = '';
                for (const chunk of chunks) {
                    context += chunk;
                }
                return context;
            })
            .catch((error) => {
            if (error === `Document with id: ${id} not found`) {
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