import { generateContent, generateConversationTitle } from "./gemini_api";

export const generateWithAPI = async (fetchData, messages, message, llmProvider) => {
    if (!llmProvider) return;
    if (llmProvider.name === 'google') {
        await generateContent(fetchData, message, messages, llmProvider.apikey, llmProvider.version);
    }
}

export const generateTitle = async (fetchData, messagePair, llmProvider) => {
    if (!llmProvider) return;
    if (llmProvider.name === 'google') {
        await generateConversationTitle(fetchData, messagePair, llmProvider.version, llmProvider.apikey);
    }
}