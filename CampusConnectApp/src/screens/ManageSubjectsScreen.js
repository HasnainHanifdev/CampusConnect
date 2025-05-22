import React, { useState, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8080/api/subjects';

const ManageSubjectsScreen = () => {
    const navigation = useNavigation();
    const { user, signOut } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMySubjects = async () => {
        if (!user || user.role !== 'ROLE_TEACHER') {
            Alert.alert("Access Denied", "You are not authorized to manage subjects.");
            navigation.goBack();
            return;
        }
        setIsLoading(true);
        try {
            // Assuming backend session management handles authentication
            const response = await axios.get(`${API_URL}/teacher/my-subjects`);
            setSubjects(response.data);
        } catch (error) {
            console.error('Fetch My Subjects Error:', error.response ? error.response.data : error.message);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                Alert.alert('Authentication Error', 'Could not fetch subjects. Please sign in again.');
                await signOut();
                navigation.replace('SignIn'); // Navigate to SignIn, clearing stack
            } else {
                Alert.alert('Error', 'Failed to fetch your subjects.');
            }
        }
        setIsLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchMySubjects();
        }, [user]) // Re-fetch if user changes (e.g., re-login as different user)
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchMySubjects().then(() => setRefreshing(false));
    }, [user]);

    const handleDeleteSubject = async (subjectId) => {
        Alert.alert(
            "Delete Subject",
            "Are you sure you want to delete this subject? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_URL}/${subjectId}`);
                            Alert.alert('Success', 'Subject deleted successfully.');
                            fetchMySubjects(); // Refresh the list
                        } catch (error) {
                            console.error('Delete Subject Error:', error.response ? error.response.data : error.message);
                            Alert.alert('Error', 'Failed to delete subject.');
                        }
                    }
                }
            ]
        );
    };

    const renderSubjectItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.subjectItemContainerOuter}
            onPress={() => navigation.navigate('SubjectDetail', { subjectId: item.id, subjectName: item.name })}
        >
            <View style={styles.subjectItemContainer}>
                <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{item.name}</Text>
                    <Text style={styles.subjectDescription}>{item.description || 'No description.'}</Text>
                    <Text style={styles.viewDetailsPrompt}>Tap to view/edit details & resources</Text> 
                </View>
                {/* Edit/Delete for general subject name/desc can remain here or be moved to SubjectDetailScreen */}
                {/* For this iteration, let's keep basic edit/delete here for quick access */}
                <View style={styles.subjectActions}>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.editButton]} 
                        onPress={(e) => {
                            e.stopPropagation(); // Prevent TouchableOpacity parent from firing
                            navigation.navigate('EditSubject', { subjectId: item.id });
                        }}
                    >
                        <Text style={styles.actionButtonText}>Edit Name/Desc</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={(e) => {
                            e.stopPropagation(); // Prevent TouchableOpacity parent from firing
                            handleDeleteSubject(item.id);
                        }}
                    >
                        <Text style={styles.actionButtonText}>Delete Subject</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (isLoading && !subjects.length) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Manage My Subjects</Text>
                <Button
                    title="Create New Subject"
                    onPress={() => navigation.navigate('CreateSubject')}
                />
            </View>
            {subjects.length === 0 && !isLoading ? (
                <View style={styles.centered}>
                    <Text>You haven't created any subjects yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={subjects}
                    renderItem={renderSubjectItem}
                    keyExtractor={item => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f8',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: 'white',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    list: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    subjectItemContainerOuter: { // Wrapper for pressable area
        marginVertical: 8,
        // No specific styling needed here unless you want to add outer shadow/border
    },
    subjectItemContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        // marginVertical: 8, // Moved to Outer
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        // flexDirection: 'row', // Changed to column for details prompt
        // justifyContent: 'space-between',
        // alignItems: 'center',
    },
    subjectInfo: {
        flex: 1, 
        marginBottom: 10, // Add space before action buttons if they are below
    },
    subjectName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
    },
    subjectDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    viewDetailsPrompt: {
        fontSize: 12,
        color: '#007bff',
        fontStyle: 'italic',
        marginTop: 5,
    },
    subjectActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Align buttons to the right
        alignItems: 'center',
        marginTop: 5, // Space above buttons
    },
    actionButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
        marginLeft: 10, // Space between buttons
    },
    editButton: {
        backgroundColor: '#007bff',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '500',
    }
});

export default ManageSubjectsScreen;
