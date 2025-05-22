import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8080/api/subjects';

const CreateSubjectScreen = () => {
    const navigation = useNavigation();
    const { signOut } = useAuth(); // For handling auth errors
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateSubject = async () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Subject name is required.');
            return;
        }
        setIsLoading(true);
        try {
            await axios.post(API_URL, { name, description });
            Alert.alert('Success', 'Subject created successfully!');
            navigation.goBack(); // Go back to ManageSubjectsScreen, which should refresh
        } catch (error) {
            console.error('Create Subject Error:', error.response ? error.response.data : error.message);
            if (error.response) {
                if (error.response.status === 401 || error.response.status === 403) {
                    Alert.alert('Authentication Error', 'Could not create subject. Please sign in again.');
                    await signOut();
                    navigation.replace('SignIn');
                } else if (error.response.data && error.response.data.message) {
                     Alert.alert('Error', error.response.data.message); // Display specific backend error
                } else {
                    Alert.alert('Error', 'Failed to create subject. Please try again.');
                }
            } else {
                Alert.alert('Error', 'An unexpected error occurred.');
            }
        }
        setIsLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create New Subject</Text>
            <TextInput
                style={styles.input}
                placeholder="Subject Name (e.g., Math 101)"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Subject Description (Optional)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
            />
            {isLoading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : (
                <Button title="Create Subject" onPress={handleCreateSubject} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
});

export default CreateSubjectScreen;
