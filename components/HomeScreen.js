import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, StatusBar, ScrollView, Dimensions, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons  } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen({ navigation, route }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [formattedCurrentDate, setFormattedCurrentDate] = useState(formatDate(new Date()));
  const [calendarMonth, setCalendarMonth] = useState(getCurrentMonth());
  const [calendarKey, setCalendarKey] = useState(Date.now());
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [profilePictureUri, setProfilePictureUri] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        if (user) {
          const storedProfilePicture = await AsyncStorage.getItem(`profilePicture_${user.uid}`);
          setProfilePictureUri(storedProfilePicture);
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    fetchProfilePicture();
  }, [user]);

// Add entry based on the selected date
  const handleAddTask = () => {
    if (selectedDate) {
      navigation.navigate('AddTask', { date: selectedDate });
    }
  };

 // Fetch entries based on the selected date
const fetchEntries = async () => {
  try {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.log('User not authenticated.');
      return;
    }

    const existingEntries = await AsyncStorage.getItem(`tasks_${userId}`);
    const allEntries = existingEntries ? JSON.parse(existingEntries) : [];
    console.log('All entries:', allEntries);

    // Filter entries based on selectedDate or currentDate
    const filteredEntries = selectedDate
      ? allEntries.filter(entry => entry.date === selectedDate)
      : allEntries.filter(entry => entry.date === currentDate);
    console.log('Filtered entries:', filteredEntries);

    setEntries(filteredEntries);
  } catch (error) {
    console.error('Error retrieving data from AsyncStorage:', error);
  }
};

// useFocusEffect hook to call fetchEntries
useFocusEffect(
  useCallback(() => {
    fetchEntries();
  }, [selectedDate, currentDate])
);

// Delete the selected entry
const handleDeleteEntry = async (index) => {
  try {
    // Ensure the index is valid
    if (index < 0 || index >= entries.length) {
      console.error('Invalid index:', index);
      return;
    }

    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Fetch all entries from AsyncStorage
              const auth = getAuth();
              const userId = auth.currentUser?.uid;

              if (!userId) {
                console.error('User not authenticated.');
                return;
              }

              const existingEntries = await AsyncStorage.getItem(`tasks_${userId}`);
              const allEntries = existingEntries ? JSON.parse(existingEntries) : [];
              
              // Filter entries to keep only those not matching the selected date
              const updatedEntries = allEntries.filter(entry => {
                // Only modify entries for the selected date
                if (entry.date === selectedDate) {
                  return false; 
                }
                return true;
              });

              // Remove the entry at the specified index for the selected date
              const dateSpecificEntries = allEntries.filter(entry => entry.date === selectedDate);
              const filteredEntries = dateSpecificEntries.filter((_, i) => i !== index);
              
              // Combine entries back
              const newEntries = [
                ...updatedEntries,
                ...filteredEntries
              ];

              // Update AsyncStorage
              await AsyncStorage.setItem(`tasks_${userId}`, JSON.stringify(newEntries));

              // Update state
              setEntries(filteredEntries);
              console.log('Entry deleted and AsyncStorage updated.');
            } catch (error) {
              console.error('Error deleting entry:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  } catch (error) {
    console.error('Error handling delete:', error);
  }
};

// Toggle Checkbox
  const handleToggleCheckbox = async (taskId, selectedDate) => {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
  
      if (!userId) {
        console.log('User not authenticated.');
        return;
      }
  
      // Log values being used
      console.log('Fetching existing entries...');
      console.log('Task ID to toggle:', taskId);
      console.log('Selected date:', selectedDate);
  
      // Retrieve existing entries
      const existingEntries = await AsyncStorage.getItem(`tasks_${userId}`);
      const allEntries = existingEntries ? JSON.parse(existingEntries) : [];
      console.log('All entries:', allEntries);
  
      // Check if selectedDate is valid
      if (!selectedDate) {
        console.log('Selected date is undefined or invalid.');
        return;
      }
  
      // Find tasks that match the selected date
      const tasksForSelectedDate = allEntries.filter(entry => entry.date === selectedDate);
      console.log('Tasks for selected date:', tasksForSelectedDate);
  
      // Check if the task with the given ID exists for the selected date
      const entryExists = tasksForSelectedDate.some(entry => entry.id === taskId);
      if (!entryExists) {
        console.log('Task not found or does not match the selected date.');
        return;
      }
  
      // Update the entry's completed state only for the selected date
      console.log('Updating entry...');
      const updatedEntries = allEntries.map((entry) => {
        if (entry.id === taskId) {
          console.log(`Toggling task ID ${taskId}. Current completed status: ${entry.completed}`);
          return { ...entry, completed: !entry.completed };
        }
        return entry;
      });
  
      console.log('Updated entries:', updatedEntries);
  
      // Save the updated entries back to AsyncStorage
      console.log('Saving updated entries to AsyncStorage...');
      await AsyncStorage.setItem(`tasks_${userId}`, JSON.stringify(updatedEntries));
      
      // Update the local state
      setEntries(updatedEntries);
  
      console.log('Local state updated.');
  
    } catch (error) {
      console.error('Error updating checkbox status:', error);
    }
  };

  const handleSave = async (updatedEntry, index) => {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
  
      if (!userId) {
        console.log('User not authenticated.');
        return;
      }
  
      const existingEntries = await AsyncStorage.getItem(`tasks_${userId}`);
      const allEntries = existingEntries ? JSON.parse(existingEntries) : [];
  
      // Update the specific entry
      const updatedEntries = allEntries.map((entry, i) => 
        i === index ? { ...entry, ...updatedEntry } : entry
      );
  
      // Save the updated entries back to AsyncStorage
      await AsyncStorage.setItem(`tasks_${userId}`, JSON.stringify(updatedEntries));
      
      // Update the local state
      setEntries(updatedEntries);
  
      console.log('Entry updated and AsyncStorage updated.');
    } catch (error) {
      console.error('Error saving updated entry:', error);
    }
  };
  
// Edit the entry
const handleEditEntry = (entry) => {
  setSelectedEntry(entry);
  console.log(entry);
  navigation.navigate('EditTask', { entryId: entry.id, currentDate: entry.date });
};



  useEffect(() => {
    if (route.params?.newTask) {
      const entryExists = entries.some(entry => 
        entry.title === route.params.newTask.title && 
        entry.date === route.params.newTask.date
      );
      if (!entryExists) {
        setEntries(prevEntries => [...prevEntries, route.params.newTask]);
      }
      navigation.setParams({ newTask: null });
    }

    if (route.params?.updatedTask !== undefined && route.params?.index !== undefined) {
      handleUpdateEntry(route.params.updatedTask, route.params.index);
      navigation.setParams({ updatedTask: null, index: null });
    }
  }, [route.params?.newTask, route.params?.updatedTask]);

  useEffect(() => {
    setCalendarMonth(getCurrentMonth());
    setFormattedCurrentDate(formatDate(new Date()));
  }, []);

  const entriesByDate = entries.filter(entry => entry.date === selectedDate);

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleGoToToday = () => {
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];
    const todayMonth = getCurrentMonth(today);

    setSelectedDate(todayDate);
    setCalendarMonth(todayMonth);
    setFormattedCurrentDate(formatDate(today));
    setCalendarKey(Date.now());
  };

  function getCurrentMonth(date = new Date()) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${year}-${month < 10 ? `0${month}` : month}`;
  }

  function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? `0${day}` : day}-${month < 10 ? `0${month}` : month}-${year}`;
  }

// Hashtage
  const displayHashtags = (entries) => {
    const tags = new Map();
    entries.forEach(entry => {
      entry.hashtags.forEach(tag => {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      });
    });
    return Array.from(tags.keys());
  };
  const displayedHashtags = displayHashtags(entriesByDate);

  const navigateToHashtagScreen = (hashtag) => {
    // Ensure the hashtag is a string and trim it to avoid issues
    const sanitizedHashtag = hashtag.trim();
  
    // Filter entries to include only those that have the specified hashtag
    const filteredEntries = entries.filter(entry => entry.hashtags.includes(sanitizedHashtag));
  
    // Navigate to the HashtagScreen with the hashtag and filtered entries
    navigation.navigate('HashtagScreen', { hashtag: sanitizedHashtag, tasks: filteredEntries });
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Image source={require('../assets/PlanNow.png')} style={styles.logo} />


      {profilePictureUri ? (
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: profilePictureUri }} style={styles.profileImage} />
        </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <Image source={require('../assets/Profile.png')} style={styles.profileImage} />
          </TouchableOpacity>
        )}

      
      <View style={styles.calendarContainer}>
        <Calendar
          key={calendarKey}
          current={calendarMonth}
          onDayPress={onDayPress}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: '#2B3A67',
              textColor: '#FFFFFF',
            },
            [currentDate]: {
              selected: selectedDate === currentDate,
              selectedColor: '#2B3A67',
              textColor: selectedDate === currentDate ? '#FFFFFF' : '#2B3A67',
            },
          }}
          theme={{
            calendarBackground: '#F0F8FF', 
            dayTextColor: '#003366',
            todayTextColor: 'red', 
            selectedDayBackgroundColor: '#FF0000', 
            selectedDayTextColor: '#FFFFFF', 
            textSectionTitleColor: '#003366', 
            arrowColor: '#003366', 
            monthTextColor: '#003366', 
            monthTextFontWeight: '700',
            textDayHeaderFontWeight: '700', 
          }}
          style={styles.calendar}
        />
        <TouchableOpacity style={styles.goToTodayIcon} onPress={handleGoToToday}>
          <View style={styles.iconWithText}>
            <MaterialIcons name="date-range" size={30} color="#2B3A67" />
            <Text style={styles.todayText}>Today</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.addButton, !selectedDate && { opacity: 0.5 }]}
        onPress={handleAddTask}
        disabled={!selectedDate}
      >
        <Text style={styles.addButtonText}>ADD AN ENTRY ON THIS DATE</Text>
        {/* <Icon name="plus-circle" size={30} color="#2B3A67" /> */}
      </TouchableOpacity>

      {/* <View style={styles.line}></View> */}

      <View style={styles.hashtagsContainer}>
        {displayedHashtags.map((hashtag, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigateToHashtagScreen(hashtag)}
            >
              <Text style={styles.hashtagText}>{`${hashtag}`}</Text>
            </TouchableOpacity>
          ))}
      </View>

      {entriesByDate.length > 0 ? (
        <>
          <View style={styles.line}></View>
          <Text style={styles.todayEntriesText}>Entries for {formattedCurrentDate}</Text>
        </>
      ) : (
        <Text style={styles.noEntriesText}>No entries for today</Text>
      )}
       
      
      <View style={styles.entryContainer}>
      {entriesByDate.map((entry, index) => (

        <TouchableOpacity onPress={() => handleEditEntry(entry)}>
        <View key={index} style={styles.entryItem}>
          <View style={styles.entryContent}>
            {entry.type === 'task' && (
              <TouchableOpacity onPress={() => handleToggleCheckbox(entry.id, selectedDate)}>
              <Ionicons
              name={entry.completed ? 'checkbox' : 'square-outline'}
              size={30}
              color={entry.completed ? '#B0C4DE' : '#B0C4DE'}
              style={{paddingLeft: 5 }}
              />
              </TouchableOpacity>
            )}
              <Text
                style={[
                  styles.entryText,
                  entry.completed && styles.entryTextCompleted,
                ]}
              >
                {entry.title}
              </Text>
          </View>
          <View style={styles.entryActions}>
            {/* <TouchableOpacity onPress={() => handleEditEntry(entry)}>
              <AntDesign name="edit" size={24} color="#2B3A67" style={{ paddingRight: 10 }}/>
            </TouchableOpacity> */}

            <TouchableOpacity onPress={() => handleDeleteEntry(index)}>
              <AntDesign name="delete" size={24} color="red" style={{ paddingRight: 10 }}/>
            </TouchableOpacity>
          </View>
        </View>
        </TouchableOpacity>
      ))}
    </View>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#FFFFFF', 
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 110,
    resizeMode: 'contain',
    alignSelf: 'flex-start',
  },
  profileButton: {
    position: 'absolute',
    top: 30,
    right: 40,
    width: 40,
    height: 40,
  },
  profileImage: {
    width: '140%',
    height: '140%',
    borderRadius: 100,
  },
  calendarContainer: {
    position: 'relative',
    elevation: 2,
  },
  calendar: {
    width: screenWidth * 0.9,
    height: 380,
    borderRadius: 15,
    marginBottom: 20,
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#B0C4DE', 
    elevation: 3,
  },
  goToTodayIcon: {
    position: 'absolute',
    bottom: 25,
    right: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 0,
  },
  iconWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  todayText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#2B3A67', 
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4169E1',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
    elevation: 2,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', 
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: 10,
    width: '100%',
  },
  hashtagText: {
    fontSize: 16,
    color: '#007AFF', 
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    margin: 5,
    paddingTop: 5,
    fontSize: 18,
    fontWeight: '600',
    color: '#2B3A67',
    textAlign: 'center',
  },
  entryContainer: {
    height: 300,
    width: screenWidth * 0.9,
    marginHorizontal: 20,
  },
  todayEntriesText: {
    color: '#003366',
    fontSize: 18,
    fontWeight: '600',
    margin: 15,
  },
  entryItem: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#B0C4DE',
    elevation: 2,
  },
  entryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryText: {
    marginRight: 10,
    marginLeft: 10,
    color: '#333333', 
    fontSize: 16,
  },
  entryTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#B0C4DE',
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    height: 1,
    width: '100%',
    backgroundColor: '#B0C4DE', 
  },
  crossedOut: {
    textDecorationLine: 'line-through',
    color: '#708090',
  },
  headerText: {
    paddingTop: 10,
    fontWeight: '600',
    fontSize: 18,
    color: '#2B3A67', 
    textTransform: 'uppercase',
  },
  noEntriesText: {
    paddingTop: 30,
    fontWeight: '600',
    fontSize: 16,
    textTransform: 'uppercase',
    color: '#B0C4DE', 
  },
});
