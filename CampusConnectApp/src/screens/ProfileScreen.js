import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

// Assume backend is running at this URL
const API_URL = 'http://localhost:8080/api/profile';

const ProfileScreen = ({ navigation }) => {
    const [profileData, setProfileData] = useState(null);
    const [initialProfileData, setInitialProfileData] = useState(null); // To store original data for cancellation
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [error, setError] = useState('');

    const fetchProfile = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Axios should automatically handle session cookies if the server sets them
            // and if running in an environment that supports them (like web or some native setups).
            // For Expo Go, cookie handling can be tricky. If this fails due to auth,
            // it indicates a need for token-based auth or a more robust cookie solution.
            const response = await axios.get(`${API_URL}/me`);
            setProfileData(response.data);
            setInitialProfileData(response.data); // Store for cancel
            setIsLoading(false);
        } catch (err) {
            console.error('Fetch Profile Error:', err.response ? err.response.data : err.message);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                Alert.alert('Authentication Error', 'Could not fetch profile. Please sign in again.');
                // Navigate back to SignIn if auth fails
                navigation.navigate('SignIn');
            } else {
                setError('Failed to fetch profile data. Please try again later.');
            }
            setIsLoading(false);
        }
    };

    // useFocusEffect to refetch data when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    const handleSaveChanges = async () => {
        if (!profileData) return;
        setIsLoading(true);
        setError('');
        const { firstName, lastName, bio, profilePictureUrl, contactNumber } = profileData;
        try {
            const response = await axios.put(`${API_URL}/me`, {
                firstName,
                lastName,
                bio,
                profilePictureUrl,
                contactNumber
            });
            setProfileData(response.data);
            setInitialProfileData(response.data); // Update initial data to new saved data
            setIsEditMode(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (err) {
            console.error('Update Profile Error:', err.response ? err.response.data : err.message);
            setError('Failed to update profile. Please try again.');
            Alert.alert('Error', 'Failed to update profile.');
        }
        setIsLoading(false);
    };

    const handleCancelEdit = () => {
        setProfileData(initialProfileData); // Revert to original data
        setIsEditMode(false);
    };

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    if (isLoading && !profileData) { // Show loader only on initial load
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    if (error && !profileData) {
        return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text><Button title="Retry" onPress={fetchProfile} /></View>;
    }
    
    if (!profileData) {
        // This case might be hit if initial fetch failed but wasn't an auth error to navigate away
        return <View style={styles.centered}><Text>No profile data available.</Text><Button title="Fetch Profile" onPress={fetchProfile} /></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>User Profile</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Username:</Text>
                <Text style={styles.value}>{profileData.username}</Text>
            </View>
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{profileData.email}</Text>
            </View>
             <View style={styles.fieldContainer}>
                <Text style={styles.label}>Role:</Text>
                <Text style={styles.value}>{profileData.role}</Text>
            </View>

            <Text style={styles.label}>First Name:</Text>
            {isEditMode ? (
                <TextInput
                    style={styles.input}
                    value={profileData.firstName || ''}
                    onChangeText={(val) => handleInputChange('firstName', val)}
                />
            ) : (
                <Text style={styles.value}>{profileData.firstName || 'Not set'}</Text>
            )}

            <Text style={styles.label}>Last Name:</Text>
            {isEditMode ? (
                <TextInput
                    style={styles.input}
                    value={profileData.lastName || ''}
                    onChangeText={(val) => handleInputChange('lastName', val)}
                />
            ) : (
                <Text style={styles.value}>{profileData.lastName || 'Not set'}</Text>
            )}

            <Text style={styles.label}>Bio:</Text>
            {isEditMode ? (
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={profileData.bio || ''}
                    onChangeText={(val) => handleInputChange('bio', val)}
                    multiline
                />
            ) : (
                <Text style={styles.value}>{profileData.bio || 'Not set'}</Text>
            )}

            <Text style={styles.label}>Profile Picture URL:</Text>
            {isEditMode ? (
                <TextInput
                    style={styles.input}
                    value={profileData.profilePictureUrl || ''}
                    onChangeText={(val) => handleInputChange('profilePictureUrl', val)}
                    autoCapitalize="none"
                />
            ) : (
                <Text style={styles.value}>{profileData.profilePictureUrl || 'Not set'}</Text>
            )}

            <Text style={styles.label}>Contact Number:</Text>
            {isEditMode ? (
                <TextInput
                    style={styles.input}
                    value={profileData.contactNumber || ''}
                    onChangeText={(val) => handleInputChange('contactNumber', val)}
                    keyboardType="phone-pad"
                />
            ) : (
                <Text style={styles.value}>{profileData.contactNumber || 'Not set'}</Text>
            )}

            <View style={styles.buttonContainer}>
                {isEditMode ? (
                    <>
                        <Button title="Save Changes" onPress={handleSaveChanges} disabled={isLoading} />
                        <Button title="Cancel" onPress={handleCancelEdit} color="red" />
                    </>
                ) : (
                    <Button title="Edit Profile" onPress={() => setIsEditMode(true)} />
                )}
            </View>
            {isLoading && isEditMode && <ActivityIndicator style={{marginTop: 10}} />}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    fieldContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#333',
    },
    value: {
        fontSize: 16,
        marginBottom: 10,
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        minWidth: '100%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        fontSize: 16,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: 'white',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    }
});

export default ProfileScreen;
