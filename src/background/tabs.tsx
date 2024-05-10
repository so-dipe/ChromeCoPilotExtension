import { DocumentsDB } from "../db/db";

let db: DocumentsDB | null = new DocumentsDB();

const handleDocDelete = (tabId) => {
    db && db.deleteDocument(tabId);
}

chrome.tabs.onRemoved.addListener((tabId) => { handleDocDelete(tabId)});