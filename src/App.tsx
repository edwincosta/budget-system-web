import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Forecasts from './pages/Forecasts';
import Budgets from './pages/Budgets';
import Subcategories from './pages/Subcategories';
import CustomNavbar from './components/CustomNavbar';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isPublicRoute = location.pathname === '/' || location.pathname === '/register';

  return (
    <>
      {!isPublicRoute && <CustomNavbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/forecasts"
          element={
            <PrivateRoute>
              <Forecasts />
            </PrivateRoute>
          }
        />
        <Route
          path="/budgets"
          element={
            <PrivateRoute>
              <Budgets />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories/:budgetId"
          element={
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          }
        />
        <Route
          path="/subcategories/:categoryId"
          element={
            <PrivateRoute>
              <Subcategories />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;