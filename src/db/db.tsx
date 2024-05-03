import lunr from 'lunr';

interface IndexDocument {
    id: number;
    content: string;
}

const contentToChunks = (content: string): string[] => { 
    content = content.trim();
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

    constructor(dbName: string, dbVersion: number) {
        this.dbName = dbName;
        this.dbVersion = dbVersion;
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
                store.createIndex('messages', 'messages', { unique: false });
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

    async createConversation(id): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.open().then(() => {
                const transaction = this.db.transaction('conversations', 'readwrite');
                const store = transaction.objectStore('conversations');
                const request = store.add({
                    id,
                    title: "UNTITLED",
                    lastUpdated: Date.now(),
                    messages: []
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
                // transaction.objectStore('indexes').add({ index });

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

    async getDocument(id: number): Promise<any> { 
        return new Promise((resolve, reject) => { 
            this.open().then(() => {
                const transaction = this.db.transaction('documents', 'readonly');
                const store = transaction.objectStore('documents');
                const request = store.get(id);

                request.onerror = () => {
                    reject(request.error);
                };

                request.onsuccess = () => {
                    resolve(request.result);
                };
            
            })
        });
    }

    async searchDocumentChunks(documentId: number, query: string): Promise<any[]> {
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
                    const index = lunr.Index.load(JSON.parse(document.ftIndex));
                    const results = index.search(query);
                    if (results.length === 0) { 
                        const firstChunk = document.contentChunks[0];
                        const lastChunk = document.contentChunks[document.contentChunks.length - 1];
                        const chunks = firstChunk + lastChunk;
                        resolve([chunks]);
                    }
                    const chunks = results.map((result) => document.contentChunks[result.ref]);
                    resolve(chunks);
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