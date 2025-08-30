/**
 * API Demo Screen
 * Demonstrates how to use the API service in a React Native component
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
// import {apiService} from '../../services/ApiService';
import {
  subjectApiService,
  questionApiService,
  userActionApiService,
} from '../../services/index';

const ApiDemoScreen = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);

  // Fetch subjects when component mounts
  useEffect(() => {
    fetchSubjects();
    fetchUserStats();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await subjectApiService.getSubjects();
      if (response.success) {
        setSubjects(response.data || []);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await userActionApiService.getUserStats();
      if (response.success) {
        setUserStats(response.data);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user stats');
    }
  };

  const getRandomQuestion = async () => {
    try {
      const response = await questionApiService.getRandomQuestion();
      if (response.success) {
        Alert.alert(
          'Random Question',
          response.data?.question_markdown || 'No question found',
        );
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch random question');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Service Demo</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subjects</Text>
        <TouchableOpacity style={styles.button} onPress={fetchSubjects}>
          <Text style={styles.buttonText}>Refresh Subjects</Text>
        </TouchableOpacity>

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          subjects.map(subject => (
            <View key={subject._id} style={styles.subjectCard}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <Text style={styles.subjectCode}>{subject.code}</Text>
              <Text numberOfLines={2}>{subject.description}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Questions</Text>
        <TouchableOpacity style={styles.button} onPress={getRandomQuestion}>
          <Text style={styles.buttonText}>Get Random Question</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Statistics</Text>
        <TouchableOpacity style={styles.button} onPress={fetchUserStats}>
          <Text style={styles.buttonText}>Refresh Stats</Text>
        </TouchableOpacity>

        {userStats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.favorited}</Text>
              <Text>Favorited</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.deleted}</Text>
              <Text>Deleted</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.total}</Text>
              <Text>Total</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  subjectCard: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subjectCode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default ApiDemoScreen;
