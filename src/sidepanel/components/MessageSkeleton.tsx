import React from 'react';
import Skeleton from '@mui/material/Skeleton';
// import Chip from '@mui/material/Chip';
// import Avatar from "@mui/material/Avatar";

const MessageSkeleton = () => {
    return (
        <div>
            <Skeleton variant="rounded" width={300} height={20} />
            <Skeleton variant="text" sx={{ fontSize: '14px' }} />
            <Skeleton variant="text" sx={{ fontSize: '14px' }} />
        </div>        
    )
};

export default MessageSkeleton