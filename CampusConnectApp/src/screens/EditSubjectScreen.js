import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8080/api/subjects';

const EditSubjectScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { signOut } = useAuth();
    const { subjectId } = route.params;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true); // For initial data load

    useEffect(() => {
        const fetchSubjectDetails = async () => {
            setIsFetching(true);
            try {
                const response = await axios.get(`${API_URL}/${subjectId}`);
                const subject = response.data;
                setName(subject.name);
                setDescription(subject.description || '');
            } catch (error) {
                console.error('Fetch Subject Details Error:', error.response ? error.response.data : error.message);
                Alert.alert('Error', 'Failed to fetch subject details.');
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                     await signOut();
                     navigation.replace('SignIn');
                } else {
                    navigation.goBack(); // Go back if subject can't be loaded (e.g. not found)
                }
            }
            setIsFetching(false);
        };

        if (subjectId) {
            fetchSubjectDetails();
        }
    }, [subjectId, signOut, navigation]);

    const handleUpdateSubject = async () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Subject name is required.');
            return;
        }
        setIsLoading(true);
        try {
            await axios.put(`${API_URL}/${subjectId}`, { name, description });
            Alert.alert('Success', 'Subject updated successfully!');
            navigation.goBack(); // Go back to ManageSubjectsScreen, which should refresh
        } catch (error) {
            console.error('Update Subject Error:', error.response ? error.response.data : error.message);
             if (error.response) {
                if (error.response.status === 401 || error.response.status === 403) {
                    Alert.alert('Authentication Error', 'Could not update subject. Please sign in again.');
                    await signOut();
                    navigation.replace('SignIn');
                } else if (error.response.data && error.response.data.message) {
                     Alert.alert('Error', error.response.data.message);
                } else {
                    Alert.alert('Error', 'Failed to update subject. Please try again.');
                }
            } else {
                Alert.alert('Error', 'An unexpected error occurred.');
            }
        }
        setIsLoading(false);
    };

    if (isFetching) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#007bff" /></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Edit Subject</Text>
            <TextInput
                style={styles.input}
                placeholder="Subject Name"
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
                <Button title="Save Changes" onPress={handleUpdateSubject} />
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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

export default EditSubjectScreen;
