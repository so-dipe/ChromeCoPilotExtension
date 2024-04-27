/*
  This is the User's Profile Page. It displays the User's details, a sorted list of their
  Conversations through the Conversations Component and a logout button.
*/

import React from 'react';
import { useUserData, useLoginStatus, useToken } from '../hooks/chromeStorageHooks';
import Logout from '../components/Logout';
import NewChat from '../components/NewChat';
import ConversationsDB from '../../db/db';
import Conversations from '../components/Conversations'

const ProfilePage: React.FC = () => {
  const user = useUserData();

  const time = new Date();
  const hour = time.getHours();
  let greeting;
  if (hour > 12) {
    greeting = "Good Afternoon";
  } else if (hour > 12 && hour < 18) {
    greeting = "Good Evening";
  } else {
    greeting = "Good Morning";
  }
  if (user) {
    const db = new ConversationsDB(user.localId, 1);
    console.log(db)
    console.log("conversations", db.getConversations())
  }
  

  return (
    <div>
      {user && (
        <h2>{greeting}, {user.fullName}</h2>
      )}
      <NewChat />
      <Conversations />
      <Logout />
    </div>
  );
};

export default ProfilePage;