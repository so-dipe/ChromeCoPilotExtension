/**
 * Main entry point of the ChromeCoPilotExtension application.
 * Sets up routing using react-router-dom and renders the application root component.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import {
    createHashRouter,
    RouterProvider,
  } from "react-router-dom";
import WelcomePage from './pages/WelcomePage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import ContextsPage from './pages/ContextsPage';

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
  },
  {
      path: "chat/:chatId/contexts",
      element: <ContextsPage />,
  }
  ]);

root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

