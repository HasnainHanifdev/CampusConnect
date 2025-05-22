import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, RefreshControl, Button, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8080/api/notifications';

const NotificationItem = ({ item, onMarkAsRead }) => {
    return (
        <TouchableOpacity 
            style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
            onPress={() => !item.isRead && onMarkAsRead(item.id)} // Mark as read only if unread
        >
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationDetails}>
                Type: {item.type} {item.relatedEntityId ? `(ID: ${item.relatedEntityId})` : ''}
            </Text>
            <Text style={styles.notificationDate}>{new Date(item.createdAt).toLocaleString()}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );
};

const NotificationsScreen = () => {
    const navigation = useNavigation();
    const { user, signOut } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        if (!user) {
            navigation.replace('SignIn');
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.get(API_URL);
            setNotifications(response.data);
        } catch (error) {
            console.error('Fetch Notifications Error:', error.response ? error.response.data : error.message);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                Alert.alert('Authentication Error', 'Could not fetch notifications. Please sign in again.');
                await signOut();
                navigation.replace('SignIn');
            } else {
                Alert.alert('Error', 'Failed to fetch notifications.');
            }
        }
        setIsLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [user])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications().then(() => setRefreshing(false));
    }, [user]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axios.put(`${API_URL}/${notificationId}/read`);
            // Optimistically update or refetch
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            // fetchNotifications(); // Or refetch for simplicity
        } catch (error) {
            console.error('Mark as Read Error:', error.response ? error.response.data : error.message);
            Alert.alert('Error', 'Failed to mark notification as read.');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await axios.put(`${API_URL}/read-all`);
            Alert.alert('Success', response.data || 'All notifications marked as read.');
            fetchNotifications(); // Refresh the list
        } catch (error) {
            console.error('Mark All as Read Error:', error.response ? error.response.data : error.message);
            Alert.alert('Error', 'Failed to mark all notifications as read.');
        }
    };

    if (isLoading && !notifications.length) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerActions}>
                <Text style={styles.title}>My Notifications</Text>
                <Button title="Mark All Read" onPress={handleMarkAllAsRead} disabled={notifications.every(n => n.isRead)} />
            </View>
            {notifications.length === 0 && !isLoading ? (
                <View style={styles.centered}>
                    <Text>You have no notifications.</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={({ item }) => <NotificationItem item={item} onMarkAsRead={handleMarkAsRead} />}
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
    headerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    list: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    notificationItem: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1.5,
        elevation: 1.5,
        borderLeftWidth: 4,
        borderLeftColor: 'transparent', // Default for read
    },
    unreadNotification: {
        borderLeftColor: '#007bff', // Blue for unread
        backgroundColor: '#e9f5ff', // Lighter blue background for unread
    },
    notificationMessage: {
        fontSize: 15,
        fontWeight: '500', // Semibold
        color: '#333',
        marginBottom: 4,
    },
    notificationDetails: {
        fontSize: 12,
        color: '#555',
        marginBottom: 3,
    },
    notificationDate: {
        fontSize: 11,
        color: 'grey',
    },
    unreadDot: { // Optional: if you want a dot instead of border/background change
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007bff',
    }
});

export default NotificationsScreen;
