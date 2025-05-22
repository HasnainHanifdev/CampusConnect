import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/comments';

const CommentItem = ({ item, currentUsername, onCommentDeleted }) => {
    const isAuthor = item && item.authorUsername && item.authorUsername === currentUsername;

    if (!item) {
        return null;
    }

    const handleDeleteComment = () => {
        Alert.alert(
            "Delete Comment",
            "Are you sure you want to delete this comment?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_URL}/${item.id}`);
                            Alert.alert('Success', 'Comment deleted successfully.');
                            if (onCommentDeleted) {
                                onCommentDeleted(item.id); // Callback to refresh comments in parent
                            }
                        } catch (error) {
                            console.error('Delete Comment Error:', error.response ? error.response.data : error.message);
                            Alert.alert('Error', 'Failed to delete comment.');
                        }
                    }
                }
            ]
        );
    };


    return (
        <View style={styles.commentContainer}>
            <Text style={styles.commentAuthor}>
                {item.authorFirstName || item.authorUsername || 'Unknown'} {item.authorLastName || ''}
            </Text>
            <Text style={styles.commentContent}>{item.content}</Text>
            <Text style={styles.commentDate}>
                {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() + ' ' + new Date(item.createdAt).toLocaleDateString() : 'No date'}
            </Text>
            {isAuthor && (
                <Button title="Delete" onPress={handleDeleteComment} color="#ff6347" />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    commentContainer: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 6,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#e1e1e1',
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    commentContent: {
        fontSize: 14,
        color: '#555',
        marginTop: 3,
        marginBottom: 5,
    },
    commentDate: {
        fontSize: 10,
        color: 'grey',
    }
});

export default CommentItem;
