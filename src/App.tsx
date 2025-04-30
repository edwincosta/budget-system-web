import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Forecasts from './pages/Forecasts';
import Subcategories from './pages/Subcategories';
import CustomNavbar from './components/CustomNavbar';
import ListExpensesMonthly from './pages/expenses/ListExpensesMonthly';
import CreateBudget from './pages/budgets/CreateBudget';
import ViewBudget from './pages/budgets/ViewBudget';
import EditBudget from './pages/budgets/EditBudget';
import DeleteBudget from './pages/budgets/DeleteBudget';
import ListBudgets from './pages/budgets/ListBudgets';
import ListForecasts from './pages/forecasts/ListForecasts';
import CreateCategory from './pages/categories/CreateCategory';
import CreateForecast from './pages/forecasts/CreateForecast';
import EditForecast from './pages/forecasts/EditForecast';
import ListCategories from './pages/categories/ListCategories';
import ViewCategory from './pages/categories/ViewCategory';
import EditCategory from './pages/categories/EditCategory';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};

const PublicRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Routes>
);

const PrivateRoutes: React.FC = () => (
  <Routes>
    {/* Dashboard */}
    <Route
      path="/dashboard"
      element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      }
    />

    {/* Forecasts */}
    <Route path="/forecasts">
      <Route
          index
          element={
            <PrivateRoute>
              <ListForecasts />
            </PrivateRoute>
          }
        />
        <Route
          path="create"
          element={
            <PrivateRoute>
              <CreateForecast />
            </PrivateRoute>
          }
        />
        <Route
          path=":forecastId/edit"
          element={
            <PrivateRoute>
              <EditForecast />
            </PrivateRoute>
          }
        />
    </Route>

    {/* Budgets */}
    <Route path="/budgets">
      <Route
        index
        element={
          <PrivateRoute>
            <ListBudgets />
          </PrivateRoute>
        }
      />
      <Route
        path="create"
        element={
          <PrivateRoute>
            <CreateBudget />
          </PrivateRoute>
        }
      />
      <Route
        path=":budgetId"
        element={
          <PrivateRoute>
            <ViewBudget />
          </PrivateRoute>
        }
      />
      <Route
        path=":budgetId/edit"
        element={
          <PrivateRoute>
            <EditBudget />
          </PrivateRoute>
        }
      />
      <Route
        path=":budgetId/delete"
        element={
          <PrivateRoute>
            <DeleteBudget />
          </PrivateRoute>
        }
      />
    </Route>

    {/* Categories */}
    <Route path="/categories">
      <Route
        index
        element={
          <PrivateRoute>
            <ListCategories />
          </PrivateRoute>
        }
      />
      <Route
        path="create"
        element={
          <PrivateRoute>
            <CreateCategory />
          </PrivateRoute>
        }
      />
      <Route
        path=":categoryId"
        element={
          <PrivateRoute>
            <ViewCategory />
          </PrivateRoute>
        }
      />
      <Route
        path=":categoryId/edit"
        element={
          <PrivateRoute>
            <EditCategory />
          </PrivateRoute>
        }
      />
      <Route
        path=":budgetId/delete"
        element={
          <PrivateRoute>
            <DeleteBudget />
          </PrivateRoute>
        }
      />
    </Route>

    <Route
      path="/forecasts/:forecastId/budgets/:budgetId/categories/:categoryId/subcategories"
      element={
        <PrivateRoute>
          <Subcategories />
        </PrivateRoute>
      }
    />

    {/* Expenses */}
    <Route
      path="/budgets/:budgetId/expenses/current"
      element={
        <PrivateRoute>
          <ListExpensesMonthly />
        </PrivateRoute>
      }
    />
    <Route
      path="/budgets/:budgetId/expenses"
      element={
        <PrivateRoute>
          <ListExpensesMonthly />
        </PrivateRoute>
      }
    />
  </Routes>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const isPublicRoute = location.pathname === '/' || location.pathname === '/register';

  return (
    <>
      {!isPublicRoute && <CustomNavbar />}
      {isPublicRoute ? <PublicRoutes /> : <PrivateRoutes />}
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