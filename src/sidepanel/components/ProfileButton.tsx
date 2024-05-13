import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../hooks/chromeStorageHooks';
import Avatar from '@mui/material/Avatar';
import Backdrop from '@mui/material/Backdrop';
import Logout from './Logout';
import "tailwindcss/tailwind.css"; 
import '../assets/profile-action-card.css'

const profileActionCard = (user, handleClose) => {
    return (
        <React.Fragment>
            <div className='profile-modal'>
                <button onClick={handleClose} className='close-button'>
                    <span className="material-symbols-outlined">
                        close
                    </span>
                </button>
                <div className='profile-photo'>
                    {user.photoUrl ? (
                        <img 
                            src={user.photoUrl}
                            alt="Profile"
                        />
                    ) : (
                        <div className='initials'>
                            <span>
                                {user.displayName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>
                <h1 className='display-name'>{user.displayName}</h1>
                <div>
                    <Logout />
                </div>
            </div>
        </React.Fragment>
    );
}

const ProfileButton: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false);
    const navigate = useNavigate()
    const user = useUserData();

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
        console.log(open);
    }

    return (
        user && (
            <React.Fragment>
                <div onClick={handleClick}>
                    {user.photoUrl ? <Avatar src={user.photoUrl} /> : <Avatar>{user.displayName.charAt(0).toUpperCase()}</Avatar>}
                </div>
                <Backdrop open={open} sx={{ zIndex: 1 }}>
                    {profileActionCard(user, handleClose)}
                </Backdrop>
            </React.Fragment>
        )
    )
}

export default ProfileButton
