import React, { useState, useCallback, useEffect } from 'react'; // Added useEffect
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import PostItem from '../components/PostItem';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const API_URL = 'http://localhost:8080/api/posts';
// PROFILE_API_URL is no longer strictly needed here if username comes from AuthContext
// const PROFILE_API_URL = 'http://localhost:8080/api/profile'; 

const HomeScreen = ({ navigation }) => {
    const { user, signOut } = useAuth(); // Use user and signOut from AuthContext
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUsername, setCurrentUsername] = useState(null);

    useEffect(() => {
        if (user) {
            setCurrentUsername(user.username);
        }
    }, [user]);


    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(API_URL);
            setPosts(response.data);
        } catch (error) {
            console.error('Fetch Posts Error:', error.response ? error.response.data : error.message);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                Alert.alert('Authentication Error', 'Could not fetch posts. Please sign in again.');
                await signOut(); // Clear context
                navigation.replace('SignIn');
            } else {
                Alert.alert('Error', 'Failed to fetch posts.');
            }
        }
        setIsLoading(false);
    };

    // Fetch posts when the screen comes into focus or user changes
    useFocusEffect(
        useCallback(() => {
            if (user) { // Only fetch if user is authenticated
                fetchPosts();
            }
        }, [user]) // Rerun if user changes
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        if (user) {
            fetchPosts().then(() => setRefreshing(false));
        } else {
            setRefreshing(false); // No user, no refresh
        }
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
        navigation.replace('SignIn');
    };
    
    const handleDeletePost = async (postId) => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_URL}/${postId}`);
                            Alert.alert('Success', 'Post deleted successfully.');
                            // Refresh posts list
                            fetchPosts(); 
                        } catch (error) {
                            console.error('Delete Post Error:', error.response ? error.response.data : error.message);
                            Alert.alert('Error', 'Failed to delete post.');
                        }
                    }
                }
            ]
        );
    };


    if (isLoading && !posts.length) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Feed</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity onPress={() => navigation.navigate('CreatePost')} style={styles.headerButton}>
                         <Text style={styles.headerButtonText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.headerButton}>
                        <Text style={styles.headerButtonText}>🔔</Text>
                        {/* Optional: Add a badge for unread count here later */}
                    </TouchableOpacity>
                </View>
            </View>

            {posts.length === 0 && !isLoading ? (
                 <View style={styles.centered}><Text>No posts yet. Be the first to post!</Text></View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={({ item }) => <PostItem item={item} onDelete={handleDeletePost} currentUsername={currentUsername}/>}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContentContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
            
            <View style={styles.footerButtons}>
                {user?.role === 'ROLE_TEACHER' && (
                    <Button title="Manage My Subjects" onPress={() => navigation.navigate('ManageSubjects')} />
                )}
                {user?.role === 'ROLE_STUDENT' && (
                    <>
                        <Button title="View All Subjects" onPress={() => navigation.navigate('AllSubjects')} />
                        <Button title="Student Forum" onPress={() => navigation.navigate('StudentForum')} />
                    </>
                )}
                <Button title="Library Info" onPress={() => navigation.navigate('Library')} />
                <Button title="View Profile" onPress={() => navigation.navigate('Profile')} />
                <Button title="Sign Out" onPress={handleSignOut} color="grey"/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center', // Remove this for FlatList
        // alignItems: 'center', // Remove this for FlatList
        // padding: 20, // Keep padding for overall screen, but adjust for list
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15, // Reduced padding a bit
        paddingTop: 20, 
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerIcons: {
        flexDirection: 'row',
    },
    headerButton: {
        backgroundColor: '#007bff', // Consistent with create post button
        paddingHorizontal: 12,     // Adjusted padding
        paddingVertical: 8,
        borderRadius: 20,          // Circular
        marginLeft: 10,            // Space between icons
    },
    headerButtonText: {            // Re-using style from createPostButtonText
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 5, // Ensure space for footer buttons
    },
    // postItemContainer, postAuthor, postContent, postDate styles are now in PostItem.js
    // Keep them here if PostItem is part of this file, otherwise remove.
    // For this diff, assuming PostItem is external, so these can be removed if not used elsewhere in HomeScreen.
    // To be safe, I'll leave them commented out or ensure they are not causing issues.
    /*
    postItemContainer: { ... },
    postAuthor: { ... },
    postContent: { ... },
    postDate: { ... },
    */
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Distributes space
        alignItems: 'center', // Vertically aligns items if they have different heights
        paddingVertical: 10,
        paddingHorizontal: 5, // Add some horizontal padding
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: '#f8f8f8',
        // flexWrap: 'wrap' // Optional: if too many buttons, allow wrapping
    },
});

export default HomeScreen;
