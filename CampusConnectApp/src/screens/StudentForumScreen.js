import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, RefreshControl, Button, TouchableOpacity, Picker } from 'react-native';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8080/api/student-thoughts';

const ThoughtItem = ({ item, currentUsername, onDeleteThought }) => {
    const isAuthor = !item.isAnonymous && item.authorUsername === currentUsername;

    return (
        <View style={styles.thoughtItem}>
            <Text style={styles.thoughtTitle}>{item.title}</Text>
            <Text style={styles.thoughtAuthor}>
                By: {item.authorFirstName ? `${item.authorFirstName} ${item.authorLastName}` : item.authorUsername}
                {item.isAnonymous && " (Anonymous)"}
            </Text>
            <Text style={styles.thoughtCategory}>Category: {item.category}</Text>
            <Text style={styles.thoughtContent}>{item.content}</Text>
            <Text style={styles.thoughtDate}>{new Date(item.createdAt).toLocaleString()}</Text>
            {isAuthor && (
                <TouchableOpacity onPress={() => onDeleteThought(item.id)} style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const StudentForumScreen = () => {
    const navigation = useNavigation();
    const { user, signOut } = useAuth();
    const [thoughts, setThoughts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All"); // "All" or specific category

    const categories = ["All", "Academic", "Campus Life", "Suggestions", "Problems"]; // Example categories

    const fetchThoughts = useCallback(async () => {
        if (!user) {
            navigation.replace('SignIn');
            return;
        }
        setIsLoading(true);
        try {
            const url = selectedCategory === "All" ? API_URL : `${API_URL}/category/${selectedCategory}`;
            const response = await axios.get(url);
            setThoughts(response.data);
        } catch (error) {
            console.error('Fetch Thoughts Error:', error.response ? error.response.data : error.message);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                Alert.alert('Authentication Error', 'Could not fetch thoughts. Please sign in again.');
                await signOut();
                navigation.replace('SignIn');
            } else {
                Alert.alert('Error', 'Failed to fetch thoughts.');
            }
        }
        setIsLoading(false);
    }, [user, selectedCategory, signOut, navigation]);

    useFocusEffect(
        useCallback(() => {
            fetchThoughts();
        }, [fetchThoughts]) // Re-fetch when screen is focused or category changes
    );
    
    // Also refetch when selectedCategory changes
    useEffect(() => {
        fetchThoughts();
    }, [selectedCategory, fetchThoughts]);


    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchThoughts().then(() => setRefreshing(false));
    }, [fetchThoughts]);

    const handleDeleteThought = async (thoughtId) => {
         Alert.alert(
            "Delete Thought",
            "Are you sure you want to delete this thought?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_URL}/${thoughtId}`);
                            Alert.alert('Success', 'Thought deleted successfully.');
                            fetchThoughts(); // Refresh the list
                        } catch (error) {
                            console.error('Delete Thought Error:', error.response ? error.response.data : error.message);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete thought.');
                        }
                    }
                }
            ]
        );
    };


    if (isLoading && !thoughts.length) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Student Forum</Text>
                {user?.role === 'ROLE_STUDENT' && (
                    <Button title="Share New Thought" onPress={() => navigation.navigate('CreateThought')} />
                )}
            </View>

            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filter by Category:</Text>
                <Picker
                    selectedValue={selectedCategory}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                >
                    {categories.map(cat => <Picker.Item key={cat} label={cat} value={cat} />)}
                </Picker>
            </View>

            {thoughts.length === 0 && !isLoading ? (
                <View style={styles.centered}>
                    <Text>No thoughts shared yet in this category.</Text>
                </View>
            ) : (
                <FlatList
                    data={thoughts}
                    renderItem={({ item }) => (
                        <ThoughtItem 
                            item={item} 
                            currentUsername={user?.username} 
                            onDeleteThought={handleDeleteThought} 
                        />
                    )}
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
    container: { flex: 1, backgroundColor: '#f4f4f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 15, 
        backgroundColor: 'white', 
        borderBottomWidth: 1, 
        borderBottomColor: '#ddd' 
    },
    title: { fontSize: 20, fontWeight: 'bold' },
    filterContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    filterLabel: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },
    picker: {
        height: 50,
        width: '100%',
        // backgroundColor: '#f0f0f0', // May need specific styling per platform
    },
    list: { paddingHorizontal: 10, paddingBottom: 20 },
    thoughtItem: {
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
    thoughtTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    thoughtAuthor: { fontSize: 13, color: '#555', marginBottom: 3, fontStyle: 'italic' },
    thoughtCategory: { fontSize: 13, color: 'grey', marginBottom: 8, fontWeight: '500' },
    thoughtContent: { fontSize: 15, color: '#444', lineHeight: 21, marginBottom: 8 },
    thoughtDate: { fontSize: 11, color: 'grey', textAlign: 'right' },
    deleteButton: {
        marginTop: 10,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#ff3b30', // Red
        borderRadius: 5,
        alignSelf: 'flex-end', // Align to the right
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 13,
    },
});

export default StudentForumScreen;
