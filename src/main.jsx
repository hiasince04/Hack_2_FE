import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

import { AuthProvider } from './context/AuthContext';

import HomePage from './Homepage';
import Signup from './routes/signup';
import Login from './routes/login';
import AllList from './routes/all_list';
import DetailList from './routes/detail_list';
import SearchPage from './routes/search';

const router = createBrowserRouter([
    { 
        path: '/', 
        element: <HomePage /> 
    },
    { 
        path: '/signup', 
        element: <Signup /> 
    },
    { 
        path: '/login', 
        element: <Login /> 
    },
    { 
        path: '/all_list', 
        element: <AllList /> 
    },
    { 
        path: '/detail_list/:id', 
        element: <DetailList /> 
    },
    {
        path:"/search",
        element: <SearchPage />,
    },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </React.StrictMode>
);