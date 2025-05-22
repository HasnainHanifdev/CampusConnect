import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext'; // Import AuthProvider

import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import ManageSubjectsScreen from './src/screens/ManageSubjectsScreen';
import CreateSubjectScreen from './src/screens/CreateSubjectScreen';
import EditSubjectScreen from './src/screens/EditSubjectScreen';
import AllSubjectsScreen from './src/screens/AllSubjectsScreen';
import SubjectDetailScreen from './src/screens/SubjectDetailScreen';
import AddResourceScreen from './src/screens/AddResourceScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import StudentForumScreen from './src/screens/StudentForumScreen';   // Import
import CreateThoughtScreen from './src/screens/CreateThoughtScreen'; // Import

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen} 
        options={{ title: 'Sign In' }} 
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen} 
        options={{ title: 'Sign Up' }} 
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'My Profile' }} 
      />
      <Stack.Screen 
        name="CreatePost" 
        component={CreatePostScreen} 
        options={{ title: 'Create Post' }} 
      />
      <Stack.Screen 
        name="ManageSubjects" 
        component={ManageSubjectsScreen} 
        options={{ title: 'Manage My Subjects' }} 
      />
      <Stack.Screen 
        name="CreateSubject" 
        component={CreateSubjectScreen} 
        options={{ title: 'Create Subject' }} 
      />
      <Stack.Screen 
        name="EditSubject" 
        component={EditSubjectScreen} 
        options={{ title: 'Edit Subject' }} 
      />
      <Stack.Screen 
        name="AllSubjects" 
        component={AllSubjectsScreen} 
        options={{ title: 'All Subjects' }} 
      />
      <Stack.Screen 
        name="SubjectDetail" 
        component={SubjectDetailScreen} 
        options={({ route }) => ({ title: route.params?.subjectName || 'Subject Details' })} 
      />
      <Stack.Screen 
        name="AddResource" 
        component={AddResourceScreen} 
        options={{ title: 'Add Resource' }} 
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ title: 'Notifications' }} 
      />
      <Stack.Screen 
        name="Library" 
        component={LibraryScreen} 
        options={{ title: 'Library Information' }} 
      />
      <Stack.Screen 
        name="StudentForum" 
        component={StudentForumScreen} 
        options={{ title: 'Student Forum' }} 
      />
      <Stack.Screen 
        name="CreateThought" 
        component={CreateThoughtScreen} 
        options={{ title: 'Share Thought' }} 
      />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
