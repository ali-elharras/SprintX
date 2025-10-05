import React from 'react';
import Navbar from '../Navbar';
import {useAuth} from '../../context/AuthContext';
import theme from '../../theme';

const Layout = ({ children, title }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]"> {/* Full height minus navbar */}
        <div className="w-full max-w-xl px-6 py-8"> {/* Narrower container */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold" style={{ color: theme.colors.primary }}>
              {title}
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="mb-6 text-center">
              <p className="text-lg font-semibold" style={{ color: theme.colors.secondary }}>
                Welcome, {user?.name || 'User'}
              </p>
            </div>
            
            <div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;