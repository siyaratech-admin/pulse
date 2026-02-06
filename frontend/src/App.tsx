import React from 'react';
import { FrappeProvider, useFrappeAuth } from 'frappe-react-sdk';
import { Outlet, useLocation } from 'react-router-dom';
import MainLayout from './components/custom_components/MainLayout';
import Login from './pages/Login';
import { Toaster } from "@/components/ui/sonner"
import { NotificationToastListener } from "@/components/notifications/NotificationToastListener"
import { UserRoleProvider } from './contexts/UserRoleProvider';

// Component to handle authentication state
const AuthWrapper: React.FC = () => {
  const { currentUser, isLoading } = useFrappeAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const location = useLocation();

  return (
    <>
      <NotificationToastListener />
      {!currentUser ? (
        <Login />
      ) : (location.pathname === '/employee' || location.pathname.startsWith('/employee/')) || location.pathname.startsWith('/form/') ? (
        <Outlet />
      ) : (
        <MainLayout>
          <Outlet />
        </MainLayout>
      )}
    </>
  )
};



// import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';

// ... App function ...

function App() {
  return (
    <div className="App h-full">
      <FrappeProvider
        siteName={import.meta.env.VITE_SITE_NAME}
        socketPort={import.meta.env.VITE_SOCKET_PORT || 9005}
      >
        <UserRoleProvider>
          <AuthWrapper />
        </UserRoleProvider>
        <Toaster />
        {/* <PWAInstallPrompt /> */}
      </FrappeProvider>
    </div>
  );
}


export default App;
