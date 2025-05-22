import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8080/api/subjects';

const AllSubjectsScreen = () => {
    const navigation = useNavigation();
    const { user, signOut } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAllSubjects = async () => {
        if (!user) { // Should not happen if screen is protected, but good check
            navigation.replace('SignIn');
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.get(API_URL);
            setSubjects(response.data);
        } catch (error) {
            console.error('Fetch All Subjects Error:', error.response ? error.response.data : error.message);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                Alert.alert('Authentication Error', 'Could not fetch subjects. Please sign in again.');
                await signOut();
                navigation.replace('SignIn');
            } else {
                Alert.alert('Error', 'Failed to fetch subjects.');
            }
        }
        setIsLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchAllSubjects();
        }, [user]) // Re-fetch if user context changes, though less likely here than in ManageSubjects
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAllSubjects().then(() => setRefreshing(false));
    }, [user]);

    const renderSubjectItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.subjectItemContainer}
            onPress={() => navigation.navigate('SubjectDetail', { subjectId: item.id, subjectName: item.name })}
        >
            <Text style={styles.subjectName}>{item.name}</Text>
            <Text style={styles.subjectDescription}>{item.description || 'No description available.'}</Text>
            <Text style={styles.teacherInfo}>
                Taught by: {item.teacherFirstName || item.teacherUsername} {item.teacherLastName || ''}
            </Text>
        </TouchableOpacity>
    );

    if (isLoading && !subjects.length) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    return (
        <View style={styles.container}>
             <Text style={styles.title}>All Available Subjects</Text>
            {subjects.length === 0 && !isLoading ? (
                <View style={styles.centered}>
                    <Text>No subjects available at the moment.</Text>
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
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        paddingVertical: 20,
        paddingHorizontal: 15,
        textAlign: 'center',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    list: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    subjectItemContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
        marginBottom: 8,
    },
    teacherInfo: {
        fontSize: 13,
        color: '#007bff', // Highlight teacher info
        fontStyle: 'italic',
    }
});

export default AllSubjectsScreen;
