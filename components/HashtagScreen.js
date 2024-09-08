import React from 'react';
import { View, Image, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Utility function to display hashtags with their counts
const displayHashtags = (tasks) => {
  const tags = new Map();

  tasks.forEach((task) => {
    task.hashtags.forEach((tag) => {
      tags.set(tag, (tags.get(tag) || 0) + 1);
    });
  });

  
  return Array.from(tags.entries()).map(([tag, count]) => ({ tag, count }));
};

export default function HashtagScreen({ route, navigation }) {
  const { hashtag, tasks } = route.params;

  // Filter tasks to only include those with the current hashtag
  const filteredTasks = tasks.filter((task) => task.hashtags.includes(`${hashtag}`));

  // Display hashtags and their counts
  const displayedHashtags = displayHashtags(tasks);

  const renderTaskItem = ({ item }) => (
    <View style={styles.taskItem}>
      {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.fullTaskImage} />}

      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskText}>{item.text}</Text>

      <View style={styles.timestampContainer}>
        <Text style={styles.taskDate}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.headerHashtag}>{'< BACK'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerHashtag}>{`${hashtag}`}</Text>
      </View>

      {displayedHashtags.length > 0 && (
        <View style={styles.hashtagSummary}>
          {displayedHashtags.map(({ tag, count }) => (
            <Text key={tag} style={styles.hashtagSummaryItem}>
              {`Total entries for ${tag}: ${count}`}
            </Text>
          ))}
        </View>
      )}

      {filteredTasks.length > 0 ? (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id.toString()} // Assuming each task has a unique `id`
        />
      ) : (
        <Text style={styles.noTasksText}>No tasks found with this hashtag.</Text>
      )}
    </View>
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
  },
  backButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  headerHashtag: {
    padding: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  hashtagSummary: {
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: '#B0C4DE',
  },
  hashtagSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2B3A67',
  },
  hashtagSummaryItem: {
    fontSize: 16,
    color: '#2B3A67',
    marginTop: 5,
  },
  taskItem: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#B0C4DE',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fullTaskImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2B3A67',
    marginTop: 10,
  },
  taskText: {
    fontSize: 16,
    color: '#2B3A67',
    marginTop: 5,
  },
  timestampContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  taskDate: {
    fontSize: 12,
    color: '#A1A1A1',
  },
  noTasksText: {
    fontSize: 18,
    color: '#A1A1A1',
    textAlign: 'center',
    marginTop: 20,
  },
});
