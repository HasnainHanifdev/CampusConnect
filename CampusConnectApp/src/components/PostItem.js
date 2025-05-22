import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TextInput, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import CommentItem from './CommentItem'; // Import CommentItem

const COMMENTS_API_URL = 'http://localhost:8080/api/posts'; // Base for /:postId/comments
const SINGLE_COMMENT_API_URL = 'http://localhost:8080/api/comments'; // Base for /:commentId

const PostItem = ({ item, onDelete, currentUsername }) => {
    const isAuthorOfPost = item && item.authorUsername && item.authorUsername === currentUsername;

    const [comments, setComments] = useState([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    if (!item) {
        return null;
    }

    const fetchComments = async () => {
        if (!item.id) return;
        setIsLoadingComments(true);
        try {
            const response = await axios.get(`${COMMENTS_API_URL}/${item.id}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error(`Error fetching comments for post ${item.id}:`, error);
            Alert.alert('Error', 'Could not load comments.');
        }
        setIsLoadingComments(false);
    };

    const handleToggleComments = () => {
        const newShowComments = !showComments;
        setShowComments(newShowComments);
        if (newShowComments && comments.length === 0) { // Fetch only if opening and comments not loaded
            fetchComments();
        }
    };
    
    const handleAddComment = async () => {
        if (!newComment.trim()) {
            Alert.alert('Error', 'Comment cannot be empty.');
            return;
        }
        if (!item.id) return;

        setIsSubmittingComment(true);
        try {
            const response = await axios.post(`${COMMENTS_API_URL}/${item.id}/comments`, {
                content: newComment,
            });
            setComments(prevComments => [response.data, ...prevComments]); // Add to top for visibility
            setNewComment('');
            // No need to call fetchComments() if we optimistically update
        } catch (error) {
            console.error(`Error adding comment to post ${item.id}:`, error);
            Alert.alert('Error', 'Failed to add comment.');
        }
        setIsSubmittingComment(false);
    };

    const onCommentDeleted = (deletedCommentId) => {
        setComments(prevComments => prevComments.filter(comment => comment.id !== deletedCommentId));
    };


    return (
        <View style={styles.postItemContainer}>
            <Text style={styles.postAuthor}>
                {item.authorFirstName || item.authorUsername || 'Unknown Author'} {item.authorLastName || ''}
            </Text>
            <Text style={styles.postContent}>{item.content || 'No content'}</Text>
            <Text style={styles.postDate}>
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'No date'}
            </Text>
            
            <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={handleToggleComments} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>
                        {showComments ? 'Hide' : 'View'} Comments ({comments.length})
                    </Text>
                </TouchableOpacity>
                {isAuthorOfPost && (
                    <TouchableOpacity onPress={() => onDelete(item.id)} style={[styles.actionButton, styles.deleteButton]}>
                         <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete Post</Text>
                    </TouchableOpacity>
                )}
            </View>

            {showComments && (
                <View style={styles.commentsSection}>
                    {isLoadingComments ? (
                        <ActivityIndicator size="small" color="#007bff" />
                    ) : (
                        <FlatList
                            data={comments}
                            renderItem={({ item: commentItem }) => (
                                <CommentItem 
                                    item={commentItem} 
                                    currentUsername={currentUsername} 
                                    onCommentDeleted={onCommentDeleted}
                                />
                            )}
                            keyExtractor={commentItem => commentItem.id.toString()}
                            ListEmptyComponent={<Text style={styles.noCommentsText}>No comments yet.</Text>}
                        />
                    )}
                    <View style={styles.addCommentContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Write a comment..."
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                        />
                        <Button 
                            title={isSubmittingComment ? "Submitting..." : "Post Comment"}
                            onPress={handleAddComment} 
                            disabled={isSubmittingComment}
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    postItemContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    postAuthor: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    postContent: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    postDate: {
        fontSize: 12,
        color: 'gray',
        marginBottom: 10,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    actionButtonText: {
        color: '#007bff',
        fontSize: 13,
    },
    deleteButton: {
        // No specific style needed if text color is enough
    },
    deleteButtonText: {
        color: '#ff3b30', // iOS system red for delete actions
    },
    commentsSection: {
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    addCommentContainer: {
        marginTop: 10,
    },
    commentInput: {
        backgroundColor: '#f8f8f8',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        fontSize: 14,
        marginBottom: 8,
        minHeight: 50,
    },
    noCommentsText: {
        textAlign: 'center',
        color: 'grey',
        marginTop: 10,
    }
});

export default PostItem;
