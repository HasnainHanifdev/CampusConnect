import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For persisting auth state (optional)

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // user will be an object e.g., { username: 'name', role: 'ROLE_STUDENT' }
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Optional: Load user from AsyncStorage on app start
    // useEffect(() => {
    //     const loadUser = async () => {
    //         const storedUser = await AsyncStorage.getItem('user');
    //         if (storedUser) {
    //             setUser(JSON.parse(storedUser));
    //             setIsAuthenticated(true);
    //         }
    //     };
    //     loadUser();
    // }, []);

    const signIn = async (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        // Optional: Persist user to AsyncStorage
        // await AsyncStorage.setItem('user', JSON.stringify(userData));
    };

    const signOut = async () => {
        setUser(null);
        setIsAuthenticated(false);
        // Optional: Remove user from AsyncStorage
        // await AsyncStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
