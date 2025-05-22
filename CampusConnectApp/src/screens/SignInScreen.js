import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import useAuth

// Assume backend is running at this URL
const API_URL = 'http://localhost:8080/api/auth';

const SignInScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth(); // Get signIn function from context

    const handleSignIn = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Username and password are required.');
            return;
        }
        try {
            // The backend /api/auth/signin is primarily for session creation by Spring Security.
            // A successful authentication will return a 200 OK.
            const response = await axios.post(`${API_URL}/signin`, {
                username,
                password
            });

            if (response.status === 200 && response.data) {
                // Assuming response.data is { username: 'user', role: 'ROLE_STUDENT' }
                await signIn(response.data); // Update AuthContext
                Alert.alert('Success', `Sign in successful! Role: ${response.data.role}`);
                navigation.navigate('Home');
            } else {
                Alert.alert('Sign In Failed', (response.data && response.data.message) || 'An unexpected error occurred during sign-in.');
            }
        } catch (error) {
            console.error('Sign In Error:', error.response ? error.response.data : error.message);
            if (error.response && error.response.status === 401) {
                 Alert.alert('Sign In Failed', 'Invalid username or password.');
            } else {
                 Alert.alert('Sign In Failed', (error.response && error.response.data && (error.response.data.message || error.response.data.error)) || 'An unexpected error occurred.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In</Text>
            <TextInput
                style={styles.input}
                placeholder="Username or Email"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Sign In" onPress={handleSignIn} />
            <View style={styles.signUpLink}>
                <Button
                    title="Don't have an account? Sign Up"
                    onPress={() => navigation.navigate('SignUp')}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    signUpLink: {
        marginTop: 15,
    }
});

export default SignInScreen;
