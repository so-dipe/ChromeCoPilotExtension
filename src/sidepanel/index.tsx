import React from 'react';
import { createRoot } from 'react-dom/client';
import {
    createHashRouter,
    RouterProvider,
  } from "react-router-dom";
import WelcomePage from './pages/WelcomePage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);

const router = createHashRouter([
    {
      path: "/",
      element: <WelcomePage />,
    },
    {
        path: "profile",
        element: <ProfilePage />,
    },
    {
        path: "chat/:chatId",
        element: <ChatPage />,
    }
  ]);

root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
