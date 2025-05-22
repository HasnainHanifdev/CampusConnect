import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios'; // Will be used in step 4

// Assume backend is running at this URL
const API_URL = 'http://localhost:8080/api/auth';

const SignUpScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(''); // Simple text input for role

    const handleSignUp = async () => {
        if (!username || !email || !password || !role) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }
        try {
            const response = await axios.post(`${API_URL}/signup`, {
                username,
                email,
                password,
                role
            });
            Alert.alert('Success', 'Registration successful!');
            navigation.navigate('SignIn');
        } catch (error) {
            console.error('Sign Up Error:', error.response ? error.response.data : error.message);
            Alert.alert('Sign Up Failed', error.response ? error.response.data.message || error.response.data : 'An unexpected error occurred.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Role (e.g., STUDENT, TEACHER)"
                value={role}
                onChangeText={setRole}
                autoCapitalize="none"
            />
            <Button title="Sign Up" onPress={handleSignUp} />
            <View style={styles.signInLink}>
                <Button
                    title="Already have an account? Sign In"
                    onPress={() => navigation.navigate('SignIn')}
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
    signInLink: {
        marginTop: 15,
    }
});

export default SignUpScreen;
