import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert, ScrollView, Modal, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons  } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, updateProfile, deleteUser } from 'firebase/auth';

export default function ProfileScreen({ navigation }) {
  const [profilePictureUri, setProfilePictureUri] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (user) {
          const storedUsername = await AsyncStorage.getItem(`username_${user.uid}`);
          const storedProfilePicture = await AsyncStorage.getItem(`profilePicture_${user.uid}`);

          setUsername(storedUsername || `User${Math.floor(Math.random() * 1000)}`);
          setProfilePictureUri(storedProfilePicture || null);
          setEmail(user.email || '');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, [user]);

  const pickProfilePicture = async () => {
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
        const uri = result.assets[0].uri;
        setProfilePictureUri(uri);

        if (user) {
          await AsyncStorage.setItem(`profilePicture_${user.uid}`, uri);
        }
      } else {
        console.log('Image picking was canceled or no images were selected.');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const updateUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Error', 'Please enter a username.');
      return;
    }

    try {
      await updateProfile(user, { displayName: newUsername });
      await AsyncStorage.setItem(`username_${user.uid}`, newUsername);
      setUsername(newUsername);
      setNewUsername('');
      setModalVisible(false);
      Alert.alert('Success', 'Username updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignOut = () => {
    auth.signOut()
      .then(() => navigation.replace("SignInScreen"))
      .catch(error => Alert.alert('Error', error.message));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(user);
              Alert.alert('Account deleted', 'Your account has been deleted.');
              navigation.replace("SignInScreen");
            } catch (error) {
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert('Error', 'Please sign in again to delete your account.');
                navigation.replace("SignInScreen");
              } else {
                Alert.alert('Error', error.message);
              }
            }
          },
        },
      ]
    );
  };

  // //<TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
  // <Image source={{ uri: profilePictureUri }} style={styles.profileImage} />
  // </TouchableOpacity>
  // ) : (
  //   <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
  //     <Image source={require('../assets/Profile.png')} style={styles.profileImage} />
  //   </TouchableOpacity>
  // )}

  return (
    <ScrollView style={styles.container}>
      {/* <View style={styles.profilePictureContainer}>
        <Image source={{ uri: profilePictureUri }} style={styles.profilePicture} />
        <TouchableOpacity style={styles.editPictureButton} onPress={pickProfilePicture}>
          <Ionicons name="pencil" size={20} color="#FFFFFF"/>
        </TouchableOpacity>
      </View> */}

    <View style={styles.profilePictureContainer}>
      {profilePictureUri ? (
        <TouchableOpacity style={styles.profileButton} onPress={pickProfilePicture}>
          <Image source={{ uri: profilePictureUri }} style={styles.profilePicture} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.profileButton} onPress={pickProfilePicture}>
          <Image source={require('../assets/Profile.png')} style={styles.profilePicture} />
        </TouchableOpacity>
      )}
    </View>


      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={styles.username}>{username || `User${Math.floor(Math.random() * 1000)}`}</Text>
      </TouchableOpacity>

      <Text style={styles.email}>{email}</Text>

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount}>
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>

            {/* Modal for editing username */}
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter new username"
                            value={newUsername}
                            onChangeText={setNewUsername}
                        />
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.modalButton} onPress={updateUsername}>
                                <Text style={styles.modalButtonText}>Update</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    padding: 20,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 170,
    height: 170,
    borderRadius: 100,
  },
  editPictureButton: {
    position: 'absolute',
    bottom: 120,
    right: 80,
    borderRadius: 50,
    backgroundColor: '#4169E1',
    padding: 8,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  email: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  password: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4169E1',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
},
modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B9CD3',
},
modalInput: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 16,
},
buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
},
modalButton: {
    backgroundColor: '#4169E1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
},
modalButtonText: {
    color: '#fff',
    fontSize: 16,
},
modalButtonCancel: {
    backgroundColor: '#FF3B30',
},
});
