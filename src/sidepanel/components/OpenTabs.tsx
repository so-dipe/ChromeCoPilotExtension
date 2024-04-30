import React, { useState, useEffect } from 'react'
import { readPdfUrl } from '../utils/file_reader';
import { htmlParser } from '../utils/html_parser';
import { DocumentsDB } from '../../db/db';

const extractHTMl = () => { 
    return document.documentElement.outerHTML;
}

const OpenTabs: React.FC<{ onSelectTab: (tab: chrome.tabs.Tab) => void }> = ({ onSelectTab }) => {
    const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
    const [selectedTab, setSelectedTab] = useState<chrome.tabs.Tab | null>(null);
    const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
    const [docsDb, setDocsDb] = useState<any>(null);

    useEffect(() => {
        const db = new DocumentsDB();
        setDocsDb(db);

        return () => { db.close()}
    }, [])

    useEffect(() => {
        const handleTabRemove = (tabId: number) => { 
            if (selectedTab?.id === tabId) { 
                setSelectedTab(null);
            }
            docsDb.deleteDocument(tabId);
        }
        chrome.tabs.onRemoved.addListener(handleTabRemove);
        return () => {
            chrome.tabs.onRemoved.removeListener(handleTabRemove);
        }
    }, [docsDb, selectedTab])


    useEffect(() => {
        const updateTabs = () => {
            chrome.tabs.query({}, (tabs) => {
                setTabs(tabs);
            });
        }
        const updateCurrentTab = (activeInfo) => {
            chrome.tabs.get(activeInfo.tabId, (tab) => {
                setCurrentTab(tab);
            });
        };

        updateTabs();
        chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
            setCurrentTab(activeTab);
        });

        chrome.tabs.onUpdated.addListener(updateTabs);
        chrome.tabs.onRemoved.addListener(updateTabs);
        chrome.tabs.onActivated.addListener(updateCurrentTab);

        return () => {
            chrome.tabs.onUpdated.removeListener(updateTabs);
            chrome.tabs.onRemoved.removeListener(updateTabs);
            chrome.tabs.onActivated.removeListener(updateCurrentTab);
        }
    }, []);

    const handleTabSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const tabId = parseInt(event.target.value, 10);
        const tab = tabs.find((tab) => tab.id === tabId);
        setSelectedTab(tab);
        onSelectTab(tab);

        if (tab.url && tab.url.split(".").pop() === "pdf") { 
            readPdfUrl(tab.url).then((result) => {
                docsDb.storeDocument(tabId, tab.title, result);
            });
        }

        chrome.scripting.executeScript({ target: { tabId: tabId }, func: extractHTMl },
            (result) => {
                if (!chrome.runtime.lastError && result && result[0] && result[0].result) {
                    const htmlContent = result[0].result;
                    const htmlParsed = htmlParser(htmlContent);
                    docsDb.storeDocument(tabId, tab.title, htmlParsed);
                }
            }
        );
    }

    return (
        <div>
            <h5>Select Tab</h5>
            <select onChange={(e) => handleTabSelect(e)} value={selectedTab?.id}>
                {
                    tabs.map((tab) => (
                        <option key={tab.id} value={tab.id}>
                            {tab.id === currentTab?.id ? (
                                `${tab.title} - Current Tab`
                            ) : (
                                tab.title
                            )}
                        </option>
                    ))
                }
            </select>
            {selectedTab && <h4>Using tab: {selectedTab.title}</h4>}
        </div>
    )
}

export default OpenTabs;