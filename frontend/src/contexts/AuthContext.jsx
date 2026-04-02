// import React, { createContext, useContext, useEffect, useState} from 'react';
// import { useNavigate } from 'react-router-dom';

// const AuthContext = createContext(null);

// // TODO: get the BACKEND_URL.

// /*
//  * This provider should export a `user` context state that is 
//  * set (to non-null) when:
//  *     1. a hard reload happens while a user is logged in.
//  *     2. the user just logged in.
//  * `user` should be set to null when:
//  *     1. a hard reload happens when no users are logged in.
//  *     2. the user just logged out.
//  */
// export const AuthProvider = ({ children }) => {
//     const navigate = useNavigate();
//     // const user = null; // TODO: Modify me.

//     useEffect({
//         // TODO: complete me, by retriving token from localStorage and make an api call to GET /user/me.
//     }, [])

//     /*
//      * Logout the currently authenticated user.
//      *
//      * @remarks This function will always navigate to "/".
//      */
//     const logout = () => {
//         // TODO: complete me

//         navigate("/");
//     };

//     /**
//      * Login a user with their credentials.
//      *
//      * @remarks Upon success, navigates to "/profile". 
//      * @param {string} username - The username of the user.
//      * @param {string} password - The password of the user.
//      * @returns {string} - Upon failure, Returns an error message.
//      */
//     const login = async (username, password) => {
//         // TODO: complete me
//         return "TODO: complete me";
//     };

//     /**
//      * Registers a new user. 
//      * 
//      * @remarks Upon success, navigates to "/".
//      * @param {Object} userData - The data of the user to register.
//      * @returns {string} - Upon failure, returns an error message.
//      */
//     const register = async (userData) => {
//         // TODO: complete me
//         return "TODO: complete me";
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout, register }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     return useContext(AuthContext);
// };


import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Backend URL – set via Vite environment variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // On mount: check localStorage for a token and fetch user data if present
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/user/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    // Token invalid – clear it
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                localStorage.removeItem('token');
                setUser(null);
            }
        };

        fetchUser();
    }, []); // Runs only once when the component mounts

    /**
     * Logout the currently authenticated user.
     */
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate("/");
    };

    /**
     * Login a user with their credentials.
     * @param {string} username
     * @param {string} password
     * @returns {string} error message on failure, otherwise nothing (redirects)
     */
    const login = async (username, password) => {
        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const error = await response.json();
                return error.message || 'Login failed';
            }

            const data = await response.json();
            const token = data.token;
            localStorage.setItem('token', token);

            // Fetch user data after successful login
            const userResponse = await fetch(`${BACKEND_URL}/user/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (userResponse.ok) {
                const userData = await userResponse.json();
                setUser(userData.user);
            }

            navigate('/profile');
            return ''; // No error
        } catch (err) {
            console.error('Login error:', err);
            return 'Network error – please try again.';
        }
    };

    /**
     * Registers a new user.
     * @param {Object} userData - { username, firstname, lastname, password }
     * @returns {string} error message on failure, otherwise nothing (redirects)
     */
    const register = async (userData) => {
        try {
            const response = await fetch(`${BACKEND_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                return error.message || 'Registration failed';
            }

            navigate('/success');
            return ''; // No error
        } catch (err) {
            console.error('Registration error:', err);
            return 'Network error – please try again.';
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};