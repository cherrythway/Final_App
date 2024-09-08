import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert, Switch, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import uuid from 'react-native-uuid';

export default function AddTask({ route, navigation }) {
  const { date } = route.params;
  const [imageUri, setImageUri] = useState(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isCheckbox, setIsCheckbox] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need permission to access your media library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      } else {
        console.log('Image picking was canceled or no images were selected.');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const saveEntry = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title.');
      return;
    }

    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    try {
      const data = {
        id: uuid.v4(), // Generate a unique ID for the task
        type: isCheckbox ? 'task' : 'entry',
        title: title.trim(),
        text: text.trim(),
        hashtags: text.match(/#[\w]+/g) || [],
        date: String(date),
        imageUri: imageUri || '',
        userId: userId,
        createdAt: new Date().toISOString(),
        completed: false, // Add a completed flag for tasks
      };

      // Fetch existing entries for the user
      const existingEntries = await AsyncStorage.getItem(`tasks_${userId}`);
      let entries = existingEntries ? JSON.parse(existingEntries) : [];

      // Add the new entry to the list
      entries.push(data);

      // Save back to AsyncStorage
      await AsyncStorage.setItem(`tasks_${userId}`, JSON.stringify(entries));

      console.log('Data saved successfully:', data); 
      navigation.navigate('Home', { refresh: true });
    } catch (error) {
      console.error('Error saving data to AsyncStorage:', error);
      Alert.alert('Error', 'Failed to save data.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButtonText}>{'< BACK'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={saveEntry}>
          <Text style={styles.headerButtonText}>SAVE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
          <Icon name="paperclip" size={25} color="gray" />
        </TouchableOpacity>
        <Text style={styles.dateText}>{`Thu ${date}`}</Text>
      </View>

      <View style={styles.line} />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Make this a task</Text>
        <Switch
          value={isCheckbox}
          onValueChange={setIsCheckbox}
        />
      </View>

      {isCheckbox ? (
        <TouchableOpacity style={styles.checkboxContainer}>
          <View style={styles.checkbox} />
          <TextInput
            style={styles.checkboxTitleInput}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            maxLength={30}
          />
        </TouchableOpacity>
      ) : (
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          maxLength={30}
        />
      )}

      <TextInput
        style={styles.textInput}
        placeholder="Enter any comment.. (include # to organise the entry)"
        value={text}
        onChangeText={setText}
        multiline
      />

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
            <Icon name="times" size={25} color="red" />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    backgroundColor: '#F0F8FF', 
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#B0C4DE', 
    // elevation: 3,
  },
  headerButtonText: {
    padding: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366', 
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    paddingHorizontal: 20,
  },
  dateText: {
    fontSize: 14,
    paddingTop: 8,
    fontWeight: 'bold',
    color: '#003366', 
  },
  iconButton: {
    transform: [{ rotate: '-45deg' }],
    paddingLeft: 5,
    paddingTop: 10,
  },
  line: {
    height: 1,
    width: '100%',
    backgroundColor: '#B0C4DE', 
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#003366', 
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#003366', 
    marginRight: 10,
  },
  checkboxTitleInput: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#003366', 
  },
  titleInput: {
    paddingVertical: 10,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#003366', 
    marginHorizontal: 20,
  },
  textInput: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#003366', 
    marginHorizontal: 20,
    marginVertical: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'cover',
  },
  removeButton: {
    marginTop: 10,
  },
});
