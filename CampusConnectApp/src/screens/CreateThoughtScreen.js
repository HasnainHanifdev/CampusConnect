import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Switch, ScrollView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Picker } from '@react-native-picker/picker'; // Ensure this is installed or use a custom one

const API_URL = 'http://localhost:8080/api/student-thoughts';

const CreateThoughtScreen = () => {
    const navigation = useNavigation();
    const { user, signOut } = useAuth();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Academic'); // Default category
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const thoughtCategories = ["Academic", "Campus Life", "Suggestions", "Problems", "Other"];

    const handleShareThought = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('Validation Error', 'Title and content are required.');
            return;
        }
        if (!category) {
            Alert.alert('Validation Error', 'Please select a category.');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(API_URL, {
                title,
                content,
                category,
                isAnonymous
            });
            Alert.alert('Success', 'Your thought has been shared successfully!');
            navigation.goBack(); // Go back to StudentForumScreen, which should refresh
        } catch (error) {
            console.error('Share Thought Error:', error.response ? error.response.data : error.message);
            if (error.response) {
                if (error.response.status === 401 || error.response.status === 403) {
                    Alert.alert('Authentication Error', 'Could not share thought. Please sign in again or check your role.');
                    if (error.response.status === 401) await signOut(); // Only sign out on 401
                    navigation.replace('SignIn');
                } else if (error.response.data && error.response.data.message) {
                     Alert.alert('Error', error.response.data.message);
                } else {
                    Alert.alert('Error', 'Failed to share thought. Please try again.');
                }
            } else {
                Alert.alert('Error', 'An unexpected error occurred.');
            }
        }
        setIsLoading(false);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Share a New Thought / Problem</Text>
            
            <Text style={styles.label}>Title:</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter a brief title"
                value={title}
                onChangeText={setTitle}
            />

            <Text style={styles.label}>Content:</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share your detailed thoughts or problems here..."
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={5}
            />

            <Text style={styles.label}>Category:</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={category}
                    onValueChange={(itemValue) => setCategory(itemValue)}
                    style={styles.picker}
                >
                    {thoughtCategories.map(cat => <Picker.Item key={cat} label={cat} value={cat} />)}
                </Picker>
            </View>

            <View style={styles.switchContainer}>
                <Text style={styles.label}>Share Anonymously?</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isAnonymous ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={setIsAnonymous}
                    value={isAnonymous}
                />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
            ) : (
                <Button title="Share Thought" onPress={handleShareThought} />
            )}
        </ScrollView>
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
        marginBottom: 25,
        textAlign: 'center',
        color: '#333',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#444',
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    picker: {
        height: 50, 
        // width: '100%', // Usually not needed for Picker if container is styled
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        paddingVertical: 10,
    },
    loader: {
        marginTop: 20,
    }
});

export default CreateThoughtScreen;
