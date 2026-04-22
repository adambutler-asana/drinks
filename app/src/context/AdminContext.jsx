import { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('admin_auth') === 'true'
  );

  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.setItem('admin_auth', 'true');
    } else {
      sessionStorage.removeItem('admin_auth');
    }
  }, [isAuthenticated]);

  return (
    <AdminContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
