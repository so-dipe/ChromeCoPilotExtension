import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../hooks/chromeStorageHooks';
import Avatar from '@mui/material/Avatar';
import "tailwindcss/tailwind.css"; 

const ProfileButton: React.FC = () => {
    const navigate = useNavigate()
    const user = useUserData();

    const handleClick = () => {
        navigate('/profile')
    }

    return (
        (
            user &&
            (
                <div onClick={handleClick}>
                    {user.photoUrl ? <Avatar src={user.photoUrl} /> : <Avatar>{ user.fullName.charAt(0).toUpperCase()}</Avatar>}
                </div>
            )
        )
    )
}

export default ProfileButton