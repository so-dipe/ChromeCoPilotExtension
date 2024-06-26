import lunr from 'lunr';
import DOMPurify from 'dompurify';

interface IndexDocument {
    id: number;
    content: string;
}

const contentToChunks = (content: string): string[] => {
    content = DOMPurify.sanitize(content);
    const escapeChars = /[\t\n\r\f\v]/g;
    content = content.trim();
    content = content.replace(/\s+/g, ' ')
    content = content.replace(escapeChars, '');
    const chunks = content.match(/.{1,1000}\s*/g);
    return chunks ?? [content];
}

const createIndex = (chunks : string[]): any => { 
    const index = lunr(function() { 
        this.ref('id');
        this.field('content');
        chunks.forEach((chunk, i) => { 
            const document: IndexDocument = { id: i, content: chunk };
            this.add(document);
        });
    });
    return index;
}

class ConversationsDB {
    private dbName: string;
    private dbVersion: number;
    private db: IDBDatabase | null;

    constructor(dbName: string) {
        this.dbName = dbName;
        this.dbVersion = 3;
        this.db = null;
        this.open();
    }

    async open(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = () => {
                this.db = request.result;
                const store = this.db.createObjectStore('conversations', { keyPath: 'id' });
                store.createIndex('id', 'id', { unique: true });
                store.createIndex('title', 'title', { unique: false });
                store.createIndex('lastUpdated', 'lastUpdated', { unique: false });
                store.createIndex('messages', 'messages', { unique: false, multiEntry: true });
                store.createIndex('docsId', 'docsId', { unique: false, multiEntry: true });
            };
        });
    }

    async close(): Promise<void> {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }

    async getConversations(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.open().then(() => {
                const transaction = this.db.transaction('conversations', 'readonly');
                const store = transaction.objectStore('conversations');
                const request = store.getAll();

                request.onerror = () => {
                    reject(request.error);
                };

                request.onsuccess = () => {
                    resolve(request.result);
                };
            });
        });
    }

    async getConversation(id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.open().then(() => {
                const transaction = this.db.transaction('conversations', 'readonly');
                const store = transaction.objectStore('conversations');
                const request = store.get(id);

                request.onerror = () => {
                    reject(request.error);
                };

                request.onsuccess = () => {
                    if (!request.result) {
                        const created = this.createConversation(id);
                        if (created) {
                            resolve(this.getConversation(id))
                        }
                    }
                    resolve(request.result);
                };
            });
        });
    }

    async appendMessagePair(conversationId: string, messagePair: any): Promise<void> {
        if (!messagePair.user && !messagePair.bot) {
            throw new Error('Message pair must have a user and bot message');
        } 
        messagePair.type = 'message';
        console.log(messagePair);
        return new Promise((resolve, reject) => {
            this.open().then(() => {
                const transaction = this.db.transaction('conversations', 'readwrite');
                const store = transaction.objectStore('conversations');
                const request = store.get(conversationId);

                request.onerror = () => {
                    reject(request.error);
                };

                request.onsuccess = () => {
                    const conversation = request.result;
                    conversation.messages.push(messagePair);
                    conversation.lastUpdated = Date.now();
                    const updateRequest = store.put(conversation);

                    updateRequest.onerror = () => {
                        reject(updateRequest.error);
                    };

                    updateRequest.onsuccess = () => {
                        resolve();
                    };
                };
            });
        });
    }

    async appendFileToConversation(conversationId: string, file: any, id: string): Promise<void> { 
        return new Promise((resolve, reject) => {
            this.open().then(() => {
                const transaction = this.db.transaction('conversations', 'readwrite');
                const store = transaction.objectStore('conversations');
                const request = store.get(conversationId);

                request.onerror = () => {
                    reject(request.error);
                }

                request.onsuccess = () => {
                    const conversation = request.result;
                    conversation.messages.push({
                        type: 'file',
                        file: file,
                        id: id
                    })
                    conversation.lastUpdated = Date.now();
                    const updateRequest = store.put(conversation);
                    updateRequest.onerror = () => {
                        reject(updateRequest.error)
                    }
                    updateRequest.onsuccess = () => {
                        resolve();
                    }
                }
            })
        })
    }

    async createConversation(id): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.open().then(() => {
                const transaction = this.db.transaction('conversations', 'readwrite');
                const store = transaction.objectStore('conversations');
                const request = store.add({
                    id,
                    title: "UNTITLED",
                    lastUpdated: Date.now(),
                    messages: [],
                    docsId: [],
                });

                request.onerror = () => {
                    reject(request.error);
                };

                request.onsuccess = () => {
                    resolve(true);
                };
            });
        });
    }

    async updateConversationTitle(id: string, title: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.open().then(() => {
                const transaction = this.db.transaction('conversations', 'readwrite');
                const store = transaction.objectStore('conversations');
                const request = store.get(id);

                request.onerror = () => {
                    reject(request.error);
                };

                request.onsuccess = () => {
                    const conversation = request.result;
                    conversation.title = title;
                    const updateRequest = store.put(conversation);

                    updateRequest.onerror = () => {
                        reject(updateRequest.error);
                    };

                    updateRequest.onsuccess = () => {
                        resolve();
                    };
                };
            });
        });
    }

    async addDocumentToConversation(conversationId: string, docId: string): Promise<void> { 
        return new Promise((resolve, reject) => {
            this.open().then(() => {
                const transaction = this.db.transaction('conversations', 'readwrite');
                const store = transaction.objectStore('conversations');
                const request = store.get(conversationId);

                request.onerror = () => {
                    reject(request.error);
                };

                request.onsuccess = () => {
                    const conversation = request.result;
                    conversation.docsId.push(docId);
                    const updateRequest = store.put(conversation);

                    updateRequest.onerror = () => {
                        reject(updateRequest.error);
                    };

                    updateRequest.onsuccess = () => {
                        resolve();
                    };
                };
            });
        });
    }

    async removeDocumentFromConversation(conversationId: string, docId: string): Promise<void> { 
        return new Promise((resolve, reject) => {
            this.open().then(() => {
                const transaction = this.db.transaction('conversations', 'readwrite');
                const store = transaction.objectStore('conversations');
                const request = store.get(conversationId);

                request.onerror = () => {
                    reject(request.error);
                };

                request.onsuccess = () => {
                    const conversation = request.result;
                    const index = conversation.docsId.indexOf(docId);
                    if (index > -1) {
                        conversation.docsId.splice(index, 1);
                    }
                    const updateRequest = store.put(conversation);

                    updateRequest.onerror = () => {
                        reject(updateRequest.error);
                    };

                    updateRequest.onsuccess = () => {
                        resolve();
                    };
                };
            });
        });
    }

    async deleteConversation(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.open().then(() => {
                const transaction = this.db.transaction('conversations', 'readwrite');
                const store = transaction.objectStore('conversations');
                const request = store.delete(id);

                request.onerror = () => {
                    reject(request.error);
                };

                request.onsuccess = () => {
                    resolve();
                };
            });
        });
    }

    async clearConversations(): Promise<void> {
        return new Promise((resolve, reject) => { 
            this.open().then(() => { 
                const transaction = this.db.transaction('conversations', 'readwrite');
                const store = transaction.objectStore('conversations');
                const request = store.clear();

                request.onerror = () => {
                    reject(request.error);
                };

                request.onsuccess = () => {
                    resolve();
                };
            });
        });
    }

    async reset(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.close().then(() => {
                const request = indexedDB.deleteDatabase(this.dbName);

                request.onerror = () => {
                    reject(request.error);
                };

                request.onsuccess = () => {
                    resolve();
                };
            });
        });
    
    }
}

class DocumentsDB {
    private dbName: string;
    private dbVersion: number;
    private db: IDBDatabase | null;

    constructor() {
        this.dbName = "docs";
        this.dbVersion = 1;
        this.db = null;
        this.open();
    }

    async open(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = () => {
                this.db = request.result;
                const store = this.db.createObjectStore('documents', { keyPath: 'id' });
                store.createIndex('id', 'id', { unique: true });
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('contentChunks', 'contentChunks', { unique: false, multiEntry: true });
                store.createIndex('ftIndex', 'ftIndex', { unique: false });

                // this.db.createObjectStore('vectors', { autoIncrement: true });
                // this.db.createObjectStore('indexes', { autoIncrement: true });  
            };
        });
    }

    async close(): Promise<void> {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }

    async storeDocument(id: string, name: string, content: string): Promise<any> { 
        const chunks = contentToChunks(content);
        const index = createIndex(chunks);
        return new Promise((resolve, reject) => {
            this.open().then(() => {
                const transaction = this.db.transaction('documents', 'readwrite');
                const store = transaction.objectStore('documents');
                const request = store.add({
                    id,
                    name,
                    contentChunks: chunks,
                    ftIndex: JSON.stringify(index),
                });

                request.onerror = () => {
                    if (request.error.name !== 'ConstraintError') { 
                        reject(request.error);
                    }
                    this.updateDocument(id, name, content).then(resolve).catch(reject);
                };

                request.onsuccess = () => {
                    resolve(request.result);
                };
            });
        });
    };

    async updateDocument(id: string, name: string, content: string): Promise<any> { 
        new Promise((resolve, reject) => { 
            this.deleteDocument(id).then(() => { 
                this.storeDocument(id, name, content).then(resolve).catch(reject);
                console.log("Updated document", id)
            });
        });
    }

    async getDocument(id: string): Promise<any> { 
        return new Promise((resolve, reject) => { 
            this.open().then(() => {
                const transaction = this.db.transaction('documents', 'readonly');
                const store = transaction.objectStore('documents');
                const request = store.get(id);

                request.onerror = () => {
                    console.log("Getting document", request);
                    reject(request.error);
                };

                request.onsuccess = () => {
                    if (!request.result) { reject(`Document with id: ${id} not found`) };
                    console.log("Getting document", request);
                    resolve(request.result);
                };
            
            })
        });
    }

    async searchDocumentChunks(documentId: string, query: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.open().then(() => {
                const transaction = this.db.transaction('documents', 'readonly');
                const store = transaction.objectStore('documents');
                const request = store.get(documentId);

                request.onerror = () => {
                    reject(request.error);
                };                              

                request.onsuccess = () => { 
                    const document = request.result;
                    console.log("Searching document", document, documentId, query)
                    if (!document) { 
                        reject(`Document with id: ${documentId} not found`);
                    } else {
                        const index = lunr.Index.load(JSON.parse(document.ftIndex));
                        const results = index.search(query);
                        console.log("Results", results)
                        const chunks = results.map((result) => document.contentChunks[result.ref]);
                        resolve(chunks);
                    }
                    // const index = lunr.Index.load(JSON.parse(document.ftIndex));
                    // const results = index.search(query);
                    // const chunks = results.map((result) => document.contentChunks[result.ref]);
                    // resolve(chunks);
                };
                
            });
        });
    }

    async deleteDocument(id: string): Promise<void> { 
        return new Promise((resolve, reject) => {
            this.open().then(() => {
                const transaction = this.db.transaction('documents', 'readwrite');
                const store = transaction.objectStore('documents');
                const request = store.delete(id);

                request.onerror = () => {
                    reject(request.error);
                };

                request.onsuccess = () => {
                    console.log("Deleted document", id)
                    resolve();
                };
            });
        });
    }

}

export { ConversationsDB, DocumentsDB };