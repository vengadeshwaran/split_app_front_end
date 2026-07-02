import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
    const { isAuthenticated } = useSelector((state) => state.user);
    
    return isAuthenticated ? <Outlet /> : <Navigate to="/" />;

}
