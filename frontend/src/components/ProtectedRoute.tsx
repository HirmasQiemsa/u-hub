import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // If the user is not authenticated (no token), redirect to the login page
  if (!token) {
    return <Navigate to="/login" replace/>;
  }

  // If the user is authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;