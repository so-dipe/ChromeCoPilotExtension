import React, {useState, useEffect } from 'react'

const OpenTabs: React.FC = () => {
    const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
    const [selectedTab, setSelectedTab] = useState<chrome.tabs.Tab | null>(null);
    const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);


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

        chrome.scripting.executeScript(
            {
                target: { tabId: tabId },
                func: () => {
                    return document.documentElement.outerHTML;
                },
            },
            (result) => {
                console.log("script injected", result);
                if (!chrome.runtime.lastError && result && result[0] && result[0].result) {
                    const htmlContent = result[0].result;
                    console.log(htmlContent);
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
                            {tab.id === currentTab?.id ? `${tab.title} - Current Tab` : tab.title}
                        </option>
                    ))
                }
            </select>
            {selectedTab && <h4>Using tab: {selectedTab.title}</h4>}
        </div>
    )
}

export default OpenTabs;