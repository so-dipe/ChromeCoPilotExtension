import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/set-user-page.css';

const SetUserPage = () => {
    const [displayName, setDisplayName] = useState<string>("");
    const navigate = useNavigate();
    
    const handleSubmit = () => {
        if (!displayName) return; 
        chrome.storage.local.set({ 'user': { displayName: displayName, localId: displayName } }, () => { });
        chrome.storage.local.set({ 'isLoggedIn': true }, () => { });
        navigate('/profile');
    }

    const handleBack = () => {
        navigate(-1)
    }
    
    return (
        <div className='container-setuser'>
            <button onClick={handleBack} className="back-button">
                <span className="material-symbols-outlined">
                    arrow_back_ios
                </span>
            </button>
            <input type='text' placeholder='Enter a display name' onChange={(e) => {setDisplayName(e.target.value)}}/>
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}

export default SetUserPage;