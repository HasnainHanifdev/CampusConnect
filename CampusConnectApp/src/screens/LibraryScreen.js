import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, Linking, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // To handle signout on auth error
import { useNavigation } from '@react-navigation/native'; // To navigate on auth error

const API_URL = 'http://localhost:8080/api/library/info';

const LibraryScreen = () => {
    const [libraryInfo, setLibraryInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { signOut } = useAuth();
    const navigation = useNavigation();

    useEffect(() => {
        const fetchLibraryInfo = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(API_URL);
                setLibraryInfo(response.data);
            } catch (error) {
                console.error('Fetch Library Info Error:', error.response ? error.response.data : error.message);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    Alert.alert('Authentication Error', 'Could not fetch library information. Please sign in again.');
                    await signOut();
                    navigation.replace('SignIn');
                } else {
                    Alert.alert('Error', 'Failed to fetch library information.');
                }
            }
            setIsLoading(false);
        };

        fetchLibraryInfo();
    }, [signOut, navigation]);

    const handleLinkPress = (url) => {
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert(`Don't know how to open this URL: ${url}`);
            }
        });
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    if (!libraryInfo) {
        return <View style={styles.centered}><Text>Library information is currently unavailable.</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Library Information</Text>
            
            <View style={styles.infoCard}>
                <InfoRow label="Opening Hours:" value={libraryInfo.openingHours} />
                <InfoRow label="Location:" value={libraryInfo.location} />
                <InfoRow label="Contact Email:" value={libraryInfo.contactEmail} isEmail />
                {libraryInfo.websiteUrl && (
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Website:</Text>
                        <TouchableOpacity onPress={() => handleLinkPress(libraryInfo.websiteUrl)}>
                            <Text style={[styles.value, styles.linkValue]}>{libraryInfo.websiteUrl}</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <InfoRow label="Available Resources:" value={libraryInfo.availableResourcesSummary} />
            </View>
        </ScrollView>
    );
};

const InfoRow = ({ label, value, isEmail }) => {
    const handlePress = () => {
        if (isEmail) {
            Linking.openURL(`mailto:${value}`);
        }
    };

    return (
        <View style={styles.infoRow}>
            <Text style={styles.label}>{label}</Text>
            <Text style={isEmail ? [styles.value, styles.linkValue] : styles.value} onPress={isEmail ? handlePress : null}>
                {value}
            </Text>
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
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 20,
        color: '#333',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        margin: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoRow: {
        marginBottom: 15,
    },
    label: {
        fontSize: 17,
        fontWeight: '600', // Semibold
        color: '#333',
        marginBottom: 5,
    },
    value: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    linkValue: {
        color: '#007bff',
        textDecorationLine: 'underline',
    }
});

export default LibraryScreen;
