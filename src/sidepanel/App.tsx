import React from 'react'
import {useLoginStatus} from './hooks/chromeStorageHooks';
import ProfilePage from './pages/ProfilePage';
import WelcomePage from './pages/WelcomePage';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    Routes,
  } from "react-router-dom";
import ChatPage from './pages/ChatPage';

const App: React.FC = () => {
    const isLoggedIn = useLoginStatus();

    // return (
    //     <React.StrictMode>
    //       {isLoggedIn ? <ProfilePage /> : <WelcomePage />}
    //     </React.StrictMode>
    //   );
    return (
        <div>
            <Routes>
                <Route  path='/' element={<WelcomePage />} >,
                <Route  path='profile' element={<ProfilePage />} />
                <Route  path='chat' element={<ChatPage />} />
                </Route>
            </Routes>
        </div>
    )
    };

export default App;