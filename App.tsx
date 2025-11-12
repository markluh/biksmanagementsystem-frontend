
import React from 'react';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import { Role } from './types';
import './globals.css'

const App: React.FC = () => {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {currentUser.role === Role.ADMIN && <AdminDashboard />}
      {currentUser.role === Role.MEMBER && <MemberDashboard />}
    </div>
  );
};

export default App;
