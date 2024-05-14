import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/llm-provider-page.css';

const Google = () => {
    const [version, setVersion] = useState<string>("");
    const [apikey, setApikey] = useState<string>("");
    const navigate = useNavigate();

    const handleSubmit = () => {
        if (!apikey) return;
        if (!version) return;
        chrome.storage.local.set({ 'llmProvider': { version: version, apikey: apikey, name: 'google' } }, () => { });
        navigate('/set_user')
    }

    return (
        <React.Fragment>
            <div className="container-google">
                <label htmlFor="version-select">Select Version:</label>
                <select id="version-select" onChange={(e) => setVersion(e.target.value)} value={version}>
                    <option value="">Select Version</option>
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gemini-1.5-pro-latest">Gemini Pro 1.5</option>
                </select>
                <input type='text' placeholder='Enter API Key' value={apikey} onChange={(e) => setApikey(e.target.value)} />
                <button onClick={handleSubmit}>Submit</button>
            </div>
        </React.Fragment>
    )
}

const LLMProviderPage = () => {
    const [provider, setProvider] = useState<string>("");
    const navigate = useNavigate();

    const handleSelect = (event) => {
        setProvider(event.target.value);
    }
    const handleBack = () => {
        navigate(-1)
    }
    return (
        <div className="container-llm-provider">
            <button onClick={handleBack} className="back-button">
                <span className="material-symbols-outlined">
                    arrow_back_ios
                </span>
            </button>
            <label htmlFor="provider-select">Select API Provider:</label>
            <select id="provider-select" onChange={handleSelect} value={provider}>
                <option value="">Select Provider</option>
                <option value="google">Google Gemini</option>
                <option value="open-ai">Open AI</option>
            </select>
            {provider === 'google' && <Google />}
        </div>
    )
}

export default LLMProviderPage