import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/posts';

const CreatePostScreen = ({ navigation }) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmitPost = async () => {
        if (!content.trim()) {
            Alert.alert('Error', 'Post content cannot be empty.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.post(API_URL, { content });
            if (response.status === 201) { // HTTP 201 Created
                Alert.alert('Success', 'Post created successfully!');
                setContent(''); // Clear input
                navigation.goBack(); // Go back to HomeScreen (which should refresh)
            } else {
                Alert.alert('Error', 'Failed to create post. Unexpected response.');
            }
        } catch (error) {
            console.error('Create Post Error:', error.response ? error.response.data : error.message);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                 Alert.alert('Authentication Error', 'Could not create post. Please sign in again.');
                 navigation.replace('SignIn'); // Or handle more gracefully
            } else {
                Alert.alert('Error', `Failed to create post. ${error.response ? error.response.data.message || '' : ''}`);
            }
        }
        setIsLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create New Post</Text>
            <TextInput
                style={styles.input}
                placeholder="What's on your mind?"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
            />
            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <Button title="Submit Post" onPress={handleSubmitPost} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
        minHeight: 120, // For multiline
        textAlignVertical: 'top', // For multiline
    },
});

export default CreatePostScreen;
