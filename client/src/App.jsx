import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import AppLayout from './components/layout/AppLayout';
import PublicLayout from './components/layout/PublicLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDashboard from './pages/GroupDashboard';
import SkillMatches from './pages/SkillMatches';
import Sessions from './pages/Sessions';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Discover from './pages/Discover';
import Notifications from './pages/Notifications';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ]
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'groups', element: <Groups /> },
      { path: 'groups/:id', element: <GroupDashboard /> },
      { path: 'matches', element: <SkillMatches /> },
      { path: 'sessions', element: <Sessions /> },
      { path: 'messages', element: <Messages /> },
      { path: 'profile', element: <Profile /> },
      { path: 'profile/:id', element: <Profile /> },
      { path: 'edit-profile', element: <EditProfile /> },
      { path: 'discover', element: <Discover /> },
      { path: 'notifications', element: <Notifications /> },
    ]
  }
]);

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
