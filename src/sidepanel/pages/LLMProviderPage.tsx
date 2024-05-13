import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Google = () => {
    const [version, setVersion] = useState<string>("");
    const [apikey, setApikey] = useState<string>("");
    const navigate = useNavigate();

    const handleSubmit = () => {
        if (!apikey) return;
        chrome.storage.local.set({ 'llmProvider': { version: version, apikey: apikey, name: 'google' } }, () => { });
        navigate('/set_user')
    }

    return (
        <React.Fragment>
            <div>Select Version
                <select onChange={(e) => setVersion(e.target.value)}>
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gemini-1.5-pro-latest">Gemini Pro 1.5</option>
                </select>
                <input type='text' placeholder='Enter API Key' onChange={(e) => setApikey(e.target.value)}/>
                <button onClick={handleSubmit}>Submit</button>
            </div>
        </React.Fragment>
    )
}

const LLMProviderPage = () => {
    const [provider, setProvider] = useState<string>("");
    console.log(provider);

    const handleSelect = (event) => {
        setProvider(event.target.value);
    }
    return (
        <div>Select API Provider
            <select onChange={handleSelect}>
                <option value='google'>Google Gemini</option>
                <option value='open-ai'>Open AI</option>
            </select>
            {(provider === 'google') && <Google />}
        </div>
    )
}

export default LLMProviderPage