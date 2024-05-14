import React, { useState, useEffect } from "react";
import { readPdfUrl } from "../utils/file_reader";
import { htmlParser } from "../utils/html_parser";
import { DocumentsDB, ConversationsDB } from "../../db/db";
import { useUserData } from "../hooks/chromeStorageHooks";
import "tailwindcss/tailwind.css";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import "../assets/open-tabs.css";

interface Props {
  chatId: string;
  onSelectTab: (tab: chrome.tabs.Tab) => void;
}

const extractHTMl = () => {
  return document.documentElement.outerHTML;
};

const OpenTabs: React.FC<Props> = ({ chatId, onSelectTab }) => {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
  const [selectedTab, setSelectedTab] = useState<chrome.tabs.Tab | null>(null);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const docsDb = new DocumentsDB();
  const [db, setDb] = useState<ConversationsDB | null>(null);
  const user = useUserData();

  useEffect(() => {
    if (user) {
      const db = new ConversationsDB(user.localId);
      setDb(db);
    }
  }, [user]);

  useEffect(() => {
    const handleTabRemove = (tabId: number) => {
      if (selectedTab?.id === tabId) {
        setSelectedTab(null);
      }
      console.log("Tab removed", tabId);
      docsDb.deleteDocument(tabId.toString());
      db && db.removeDocumentFromConversation(chatId, tabId.toString());
    };
    chrome.tabs.onRemoved.addListener(handleTabRemove);
    return () => {
      // chrome.tabs.onRemoved.removeListener(handleTabRemove);
    };
  }, [docsDb, selectedTab, db, chatId]);

  useEffect(() => {
    const updateTabs = () => {
      chrome.tabs.query({}, (tabs) => {
        setTabs(tabs);
      });
    };

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
      // chrome.tabs.onRemoved.removeListener(updateTabs);
      chrome.tabs.onActivated.removeListener(updateCurrentTab);
    };
  }, []);

  const handleTabSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const tabId = parseInt(event.target.value, 10);
    const tab = tabs.find((tab) => tab.id === tabId);
    setSelectedTab(tab);
    onSelectTab(tab);

    if (tab.url && tab.url.split(".").pop() === "pdf") {
      readPdfUrl(tab.url).then((result) => {
        docsDb.storeDocument(tabId.toString(), tab.title, result.text);
        db && db.addDocumentToConversation(chatId, tabId.toString());
      });
      return;
    }

    chrome.scripting.executeScript(
      { target: { tabId: tabId }, func: extractHTMl },
      (result) => {
        if (
          !chrome.runtime.lastError &&
          result &&
          result[0] &&
          result[0].result
        ) {
          const htmlContent = result[0].result;
          const htmlParsed = htmlParser(htmlContent);
          docsDb.storeDocument(tabId.toString(), tab.title, htmlParsed);
          db && db.addDocumentToConversation(chatId, tabId.toString());
        }
      }
    );
  };

  return (
    <div className="container-opentabs">
      <select
        onChange={(e) => handleTabSelect(e)}
        id="tabs"
        value=""
      >
        <option defaultValue="">
          Select a tab:
        </option>
        {tabs.map((tab) => (
          <option
            key={tab.id}
            value={tab.id}
            className={tab.id === currentTab?.id ? "font-bold" : ""}
          >
            {tab.id === currentTab?.id
              ? `${tab.title} - Current Tab`
              : tab.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OpenTabs;
