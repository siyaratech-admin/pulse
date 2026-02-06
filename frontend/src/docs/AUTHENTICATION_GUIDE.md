# Authentication Implementation Guide: React + Frappe Framework

## Overview
This guide explains how to implement authentication in a React application using the Frappe Framework through the `frappe-react-sdk` package.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Setup and Configuration](#setup-and-configuration)
4. [Implementation Steps](#implementation-steps)
5. [Key Components](#key-components)
6. [Authentication Flow](#authentication-flow)
7. [Best Practices](#best-practices)

---

## Prerequisites

### Required Packages
```bash
npm install frappe-react-sdk react-router-dom react-hook-form
```

### Environment Variables
Create a `.env` file with:
```env
VITE_SITE_NAME=your-frappe-site-url
VITE_SOCKET_PORT=9005
VITE_BASE_PATH=/
```

---

## Architecture Overview

### Component Hierarchy
```
App (FrappeProvider)
├── AuthWrapper
│   ├── Loading State
│   ├── Login Component (unauthenticated)
│   └── MainLayout (authenticated)
│       └── Protected Routes (Outlet)
```

---

## Setup and Configuration

### 1. Main App Setup (`App.tsx`)

The root application component wraps everything in a `FrappeProvider`:

```tsx
import { FrappeProvider, useFrappeAuth } from 'frappe-react-sdk';

function App() {
  return (
    <div className="App">
      <FrappeProvider
        siteName={import.meta.env.VITE_SITE_NAME}
        socketPort={import.meta.env.VITE_SOCKET_PORT || 9005}
      >
        <AuthWrapper />
      </FrappeProvider>
    </div>
  );
}
```

**Key Points:**
- `FrappeProvider` initializes the connection to your Frappe backend
- `siteName`: Your Frappe site URL
- `socketPort`: WebSocket port for real-time updates (optional)

---

### 2. Authentication Wrapper

The `AuthWrapper` component handles three states:

```tsx
const AuthWrapper: React.FC = () => {
  const { currentUser, isLoading } = useFrappeAuth();

  // 1. Loading State
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 2. Unauthenticated State
  if (!currentUser) {
    return <Login />;
  }

  // 3. Authenticated State
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};
```

**State Management:**
- `currentUser`: Returns user email/username if authenticated, `null` otherwise
- `isLoading`: Boolean indicating authentication check in progress
- Automatically redirects based on authentication status

---

## Implementation Steps

### Step 1: Login Component (`Login.tsx`)

#### Import Required Hooks
```tsx
import { useFrappeAuth } from 'frappe-react-sdk';
import { useForm } from 'react-hook-form';
```

#### Setup Form and Authentication
```tsx
const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, login, logout } = useFrappeAuth();
  
  const form = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login({
        username: data.username,
        password: data.password
      });
      // Login successful - component will re-render
      // and AuthWrapper will redirect to MainLayout
    } catch (error) {
      console.error('Login failed:', error);
      // Handle error (show toast, error message, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Login form JSX
  );
};
```

---

### Step 2: Protected Routes Setup (`main.tsx`)

#### Router Configuration
```tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Contains FrappeProvider and AuthWrapper
    children: [
      {
        index: true,
        element: <Dashboard />, // Protected
      },
      {
        path: "projects",
        element: <Projects />, // Protected
      },
      // More protected routes...
    ],
  },
  {
    path: "/login",
    element: <Login />, // Public route (optional separate route)
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

**Note:** The login route at `/login` is optional since the `AuthWrapper` automatically shows the Login component when unauthenticated.

---

### Step 3: Main Layout with User Info (`MainLayout.tsx`)

```tsx
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { currentUser, logout } = useFrappeAuth();

  const handleLogout = () => {
    logout(); // Clears session and redirects to login
  };

  return (
    <div className="layout">
      <header>
        {/* Display current user */}
        <span>{currentUser}</span>
        
        {/* Logout button */}
        <Button onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </header>
      
      <main>
        {children || <Outlet />}
      </main>
    </div>
  );
};
```

---

## Key Components

### FrappeProvider
**Purpose:** Establishes connection to Frappe backend and provides authentication context

**Props:**
- `siteName` (required): Frappe site URL
- `socketPort` (optional): WebSocket port for real-time features

**Usage:**
```tsx
<FrappeProvider siteName="https://your-site.frappe.cloud" socketPort={9005}>
  {/* Your app */}
</FrappeProvider>
```

---

### useFrappeAuth Hook

**Purpose:** Provides authentication methods and state

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `currentUser` | `string \| null` | Current user's email/username or null if not logged in |
| `isLoading` | `boolean` | True while checking authentication status |
| `login` | `function` | Function to authenticate user |
| `logout` | `function` | Function to log out current user |
| `updateCurrentUser` | `function` | Refresh current user data |
| `getUserCookie` | `function` | Get authentication cookie |

**Example Usage:**
```tsx
const { currentUser, isLoading, login, logout } = useFrappeAuth();

// Check if user is logged in
if (currentUser) {
  console.log('Logged in as:', currentUser);
}

// Login
await login({ username: 'user@example.com', password: 'password123' });

// Logout
logout();
```

---

## Authentication Flow

### Login Flow
```
1. User enters credentials
   ↓
2. Call login({ username, password })
   ↓
3. SDK makes API call to Frappe
   ↓
4. Frappe validates credentials
   ↓
5. On success: Sets session cookie
   ↓
6. currentUser updates to user's email
   ↓
7. AuthWrapper detects currentUser
   ↓
8. Renders MainLayout (authenticated view)
```

### Logout Flow
```
1. User clicks logout
   ↓
2. Call logout()
   ↓
3. SDK clears session cookie
   ↓
4. currentUser becomes null
   ↓
5. AuthWrapper detects null user
   ↓
6. Renders Login component
```

### Session Persistence
- Frappe uses **HTTP-only cookies** for session management
- Sessions persist across page refreshes
- `isLoading` is true during initial auth check
- No need to manually store tokens in localStorage

---

## Best Practices

### 1. Always Show Loading State
```tsx
if (isLoading) {
  return <LoadingSpinner />;
}
```
Prevents flashing between login/authenticated states.

### 2. Error Handling
```tsx
try {
  await login({ username, password });
} catch (error) {
  // Display user-friendly error message
  if (error.httpStatus === 401) {
    setError('Invalid username or password');
  } else {
    setError('Login failed. Please try again.');
  }
}
```

### 3. Form Validation
```tsx
const form = useForm({
  defaultValues: { username: '', password: '' },
  mode: 'onBlur', // Validate on blur
});

// Add validation rules
<FormField
  name="username"
  rules={{
    required: 'Username is required',
    minLength: { value: 3, message: 'Too short' }
  }}
/>
```

### 4. Protected Route Pattern
Always wrap protected content in the authenticated layout:
```tsx
{currentUser && (
  <MainLayout>
    <ProtectedContent />
  </MainLayout>
)}
```

### 5. Centralized Authentication
Keep all auth logic in:
- `App.tsx`: FrappeProvider setup
- `AuthWrapper`: Route protection
- `Login.tsx`: Login form
- `MainLayout.tsx`: Logout functionality

### 6. Environment Configuration
Never hardcode credentials or URLs:
```tsx
// ✅ Good
siteName={import.meta.env.VITE_SITE_NAME}

// ❌ Bad
siteName="https://my-site.frappe.cloud"
```

### 7. User Feedback
Provide clear feedback during authentication:
```tsx
const [isLoading, setIsLoading] = useState(false);

// Show loading state
{isLoading && <LoadingSpinner />}

// Disable button during submission
<Button disabled={isLoading}>
  {isLoading ? 'Signing in...' : 'Sign In'}
</Button>
```

---

## Security Considerations

### 1. HTTPS Only
Always use HTTPS in production for your Frappe site.

### 2. HTTP-Only Cookies
Frappe automatically uses HTTP-only cookies - don't try to access them with JavaScript.

### 3. No Token Storage
Don't manually store authentication tokens in localStorage or sessionStorage.

### 4. CORS Configuration
Ensure your Frappe site allows requests from your React app domain.

### 5. Password Security
- Never log passwords
- Use password input type
- Implement show/hide password toggle
```tsx
<Input
  type={showPassword ? 'text' : 'password'}
  {...field}
/>
```

---

## Common Issues and Solutions

### Issue: "currentUser is null after login"
**Solution:** Check that your Frappe site URL is correct and CORS is configured.

### Issue: "Infinite loading state"
**Solution:** Verify FrappeProvider is wrapping your AuthWrapper and site is accessible.

### Issue: "Login succeeds but redirects back to login"
**Solution:** Check browser cookies are enabled and not blocked.

### Issue: "Session lost on refresh"
**Solution:** Ensure HTTP-only cookies are properly set by Frappe backend.

---

## Additional Resources

- **frappe-react-sdk Documentation**: [GitHub](https://github.com/nikkothari22/frappe-react-sdk)
- **Frappe Framework Docs**: [frappeframework.com](https://frappeframework.com)
- **React Router**: [reactrouter.com](https://reactrouter.com)

---

## Summary

**Key Takeaways:**
1. Use `FrappeProvider` to initialize Frappe connection
2. Use `useFrappeAuth` hook for all authentication operations
3. Implement `AuthWrapper` for route protection
4. Let Frappe handle session management (cookies)
5. Always show loading states
6. Handle errors gracefully
7. Keep authentication logic centralized

**Authentication is handled in 3 main files:**
- `App.tsx` - Setup FrappeProvider and AuthWrapper
- `Login.tsx` - Handle login form and credentials
- `MainLayout.tsx` - Display user info and logout

This pattern provides a secure, maintainable authentication system that integrates seamlessly with the Frappe Framework.
