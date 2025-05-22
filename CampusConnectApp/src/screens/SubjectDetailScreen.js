import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Button, TextInput, Linking, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const API_URL_SUBJECTS = 'http://localhost:8080/api/subjects';

const SubjectDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { user, signOut } = useAuth();
    const { subjectId } = route.params;

    const [subject, setSubject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingDetails, setIsEditingDetails] = useState(false);

    // Editable fields
    const [classSchedule, setClassSchedule] = useState('');
    const [lectureOutlines, setLectureOutlines] = useState('');
    const [gradingSystem, setGradingSystem] = useState('');

    const isTeacherOwner = user && subject && user.username === subject.teacherUsername && user.role === 'ROLE_TEACHER';

    const fetchSubjectDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL_SUBJECTS}/${subjectId}`);
            setSubject(response.data);
            // Initialize editable fields
            setClassSchedule(response.data.classSchedule || '');
            setLectureOutlines(response.data.lectureOutlines || '');
            setGradingSystem(response.data.gradingSystem || '');
        } catch (error) {
            console.error('Fetch Subject Details Error:', error.response ? error.response.data : error.message);
            Alert.alert('Error', 'Failed to fetch subject details.');
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                await signOut();
                navigation.replace('SignIn');
            } else {
                navigation.goBack();
            }
        }
        setIsLoading(false);
    }, [subjectId, signOut, navigation]);

    useEffect(() => {
        fetchSubjectDetails();
    }, [fetchSubjectDetails]);
    
    // For refreshing resources after adding/deleting
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (subject) { // Only refresh if subject already loaded once
                 fetchSubjectDetails();
            }
        });
        return unsubscribe;
    }, [navigation, subject, fetchSubjectDetails]);


    const handleSaveChanges = async () => {
        setIsLoading(true);
        try {
            await axios.put(`${API_URL_SUBJECTS}/${subjectId}/details`, {
                classSchedule,
                lectureOutlines,
                gradingSystem
            });
            Alert.alert('Success', 'Subject details updated successfully!');
            setIsEditingDetails(false);
            fetchSubjectDetails(); // Refresh data
        } catch (error) {
            console.error('Update Subject Details Error:', error.response ? error.response.data : error.message);
            Alert.alert('Error', 'Failed to update subject details.');
        }
        setIsLoading(false);
    };
    
    const handleDeleteResource = async (resourceId) => {
        Alert.alert(
            "Delete Resource",
            "Are you sure you want to delete this resource?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            await axios.delete(`${API_URL_SUBJECTS}/${subjectId}/resources/${resourceId}`);
                            Alert.alert('Success', 'Resource deleted successfully.');
                            fetchSubjectDetails(); // Refresh subject details to update resource list
                        } catch (error) {
                            console.error('Delete Resource Error:', error.response ? error.response.data : error.message);
                            Alert.alert('Error', 'Failed to delete resource.');
                        }
                        setIsLoading(false);
                    }
                }
            ]
        );
    };


    if (isLoading && !subject) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    if (!subject) {
        return <View style={styles.centered}><Text>Subject not found.</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerSection}>
                <Text style={styles.title}>{subject.name}</Text>
                <Text style={styles.teacher}>Taught by: {subject.teacherFirstName || subject.teacherUsername} {subject.teacherLastName || ''}</Text>
                {subject.description && <Text style={styles.description}>{subject.description}</Text>}
            </View>

            {isTeacherOwner && !isEditingDetails && (
                <Button title="Edit Subject Details" onPress={() => setIsEditingDetails(true)} />
            )}
            {isTeacherOwner && isEditingDetails && (
                 <View style={styles.editDetailsSection}>
                    <Text style={styles.sectionTitle}>Edit Details</Text>
                    <Text style={styles.label}>Class Schedule:</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={classSchedule} onChangeText={setClassSchedule} multiline />
                    
                    <Text style={styles.label}>Lecture Outlines:</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={lectureOutlines} onChangeText={setLectureOutlines} multiline />
                    
                    <Text style={styles.label}>Grading System:</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={gradingSystem} onChangeText={setGradingSystem} multiline />
                    
                    <View style={styles.buttonRow}>
                        <Button title="Save Details" onPress={handleSaveChanges} disabled={isLoading} />
                        <Button title="Cancel" onPress={() => setIsEditingDetails(false)} color="grey" />
                    </View>
                </View>
            )}

            {!isEditingDetails && (
                <>
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Class Schedule</Text>
                        <Text style={styles.detailText}>{subject.classSchedule || 'Not specified.'}</Text>
                    </View>

                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Lecture Outlines</Text>
                        <Text style={styles.detailText}>{subject.lectureOutlines || 'Not specified.'}</Text>
                    </View>

                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Grading System</Text>
                        <Text style={styles.detailText}>{subject.gradingSystem || 'Not specified.'}</Text>
                    </View>
                </>
            )}
            

            <View style={styles.detailSection}>
                <View style={styles.resourceHeader}>
                    <Text style={styles.sectionTitle}>Resources</Text>
                    {isTeacherOwner && (
                        <Button title="Add Resource" onPress={() => navigation.navigate('AddResource', { subjectId })} />
                    )}
                </View>
                {subject.resources && subject.resources.length > 0 ? (
                    subject.resources.map(res => (
                        <View key={res.id} style={styles.resourceItem}>
                            <View style={styles.resourceInfo}>
                                <Text style={styles.resourceTitle}>{res.title}</Text>
                                {res.description && <Text style={styles.resourceDescription}>{res.description}</Text>}
                                {res.link && (
                                    <TouchableOpacity onPress={() => Linking.openURL(res.link)}>
                                        <Text style={styles.resourceLink}>View Link</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {isTeacherOwner && (
                                <TouchableOpacity onPress={() => handleDeleteResource(res.id)} style={styles.deleteResourceButton}>
                                     <Text style={styles.deleteResourceButtonText}>Delete</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                ) : (
                    <Text style={styles.detailText}>No resources available for this subject yet.</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerSection: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    teacher: { fontSize: 16, color: '#555', marginBottom: 10 },
    description: { fontSize: 14, color: '#666' },
    detailSection: { marginVertical: 10, padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#444', marginBottom: 10 },
    detailText: { fontSize: 15, color: '#555', lineHeight: 22 },
    editDetailsSection: { padding: 20 },
    label: { fontSize: 16, fontWeight: '500', marginTop: 10, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10, backgroundColor: 'white' },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
    resourceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    resourceItem: { 
        paddingVertical: 10, 
        borderBottomWidth: 1, 
        borderColor: '#f0f0f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    resourceInfo: { flex: 1 },
    resourceTitle: { fontSize: 16, fontWeight: '500', color: '#007bff' },
    resourceDescription: { fontSize: 13, color: '#666', marginTop: 3 },
    resourceLink: { fontSize: 14, color: 'green', textDecorationLine: 'underline', marginTop: 5 },
    deleteResourceButton: { padding: 8, borderRadius: 5, backgroundColor: '#ff3b30'},
    deleteResourceButtonText: { color: 'white', fontSize: 12 },
});

export default SubjectDetailScreen;
