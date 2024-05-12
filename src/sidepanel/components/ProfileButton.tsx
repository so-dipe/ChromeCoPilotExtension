import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../hooks/chromeStorageHooks';
import Avatar from '@mui/material/Avatar';
import Backdrop from '@mui/material/Backdrop';
import Logout from './Logout';
import "tailwindcss/tailwind.css"; 
import CloseIcon from '@mui/icons-material/Close';


const profileActionCard = (user, handleClose) => {
    return (
        <React.Fragment>
            <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
                <CloseIcon onClick={handleClose} />
                <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                    {user.photoUrl ? (
                        <img
                            className="w-full h-full rounded-full"
                            src={user.photoUrl}
                            alt="Profile"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center rounded-full bg-gray-200">
                            <span className="text-gray-600 text-lg font-semibold">
                                {user.displayName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>
                <div className="ml-4">
                    <h1 className="text-lg font-semibold">{user.displayName}</h1>
                </div>
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
