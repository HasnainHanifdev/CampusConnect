import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const AddResourceScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { signOut } = useAuth();
    const { subjectId } = route.params;

    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddResource = async () => {
        if (!title.trim()) {
            Alert.alert('Validation Error', 'Resource title is required.');
            return;
        }
        // Optional: Validate link format if provided
        if (link.trim() && !link.startsWith('http://') && !link.startsWith('https://')) {
            Alert.alert('Validation Error', 'Please enter a valid URL (starting with http:// or https://) for the link, or leave it empty.');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`http://localhost:8080/api/subjects/${subjectId}/resources`, {
                title,
                link: link.trim() || null, // Send null if link is empty
                description
            });
            Alert.alert('Success', 'Resource added successfully!');
            navigation.goBack(); // Go back to SubjectDetailScreen, which should refresh
        } catch (error) {
            console.error('Add Resource Error:', error.response ? error.response.data : error.message);
            if (error.response) {
                if (error.response.status === 401 || error.response.status === 403) {
                    Alert.alert('Authentication Error', 'Could not add resource. Please sign in again.');
                    await signOut();
                    navigation.replace('SignIn');
                } else if (error.response.data && error.response.data.message) {
                     Alert.alert('Error', error.response.data.message);
                } else {
                    Alert.alert('Error', 'Failed to add resource. Please try again.');
                }
            } else {
                Alert.alert('Error', 'An unexpected error occurred.');
            }
        }
        setIsLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add New Resource</Text>
            <TextInput
                style={styles.input}
                placeholder="Resource Title (e.g., Chapter 1 Slides)"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Link (URL, Optional, e.g., https://example.com/doc.pdf)"
                value={link}
                onChangeText={setLink}
                autoCapitalize="none"
                keyboardType="url"
            />
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (Optional)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
            />
            {isLoading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : (
                <Button title="Add Resource" onPress={handleAddResource} />
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
        minHeight: 80,
        textAlignVertical: 'top',
    },
});

export default AddResourceScreen;
