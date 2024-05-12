import React from 'react';
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

interface SendMessageErrorProps {
    error: Error;
}

const SendMessageError: React.FC<SendMessageErrorProps> = ({error}) => {
    return (
        <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {error.message}
        </Alert>
    );
};

export default SendMessageError;
    
