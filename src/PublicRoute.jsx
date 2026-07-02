import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function PublicRoute() {
    const { isAuthenticated } = useSelector((state) => state.user);

    return isAuthenticated ? <Navigate to="/dashboard" /> : <Outlet />;

}
