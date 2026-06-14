import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {selectIsAuthenticated} from '../../store/slices/authSlice';

const ProtectedRoute = ({ children }) => {
    const isauthenticated = useSelector(selectIsAuthenticated);
    const location = useLocation();

    if (!isauthenticated) {
        // pass the intended location so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} />;
    }

    return children;
};
export default ProtectedRoute;
