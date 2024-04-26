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

export default ConversationsDB;