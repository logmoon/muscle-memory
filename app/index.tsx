import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { Workout } from './types';
import { getWorkouts } from './utils/storage';

export default function Home() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    const savedWorkouts = await getWorkouts();
    setWorkouts(savedWorkouts);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Workouts</Text>
      <Link href="/new-workout" asChild>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Create New Workout</Text>
        </TouchableOpacity>
      </Link>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/workout/${item.id}` as `/workout/${string}`} asChild>
            <TouchableOpacity style={styles.workoutItem}>
              <Text style={styles.workoutName}>{item.name}</Text>
              <Text style={styles.workoutDate}>{formatDate(item.date)}</Text>
              <Text style={styles.exerciseCount}>
                {item.exercises.length} exercises
              </Text>
            </TouchableOpacity>
          </Link>
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  workoutItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  workoutDate: {
    color: '#666',
    marginTop: 5,
  },
  exerciseCount: {
    color: '#666',
    marginTop: 5,
  },
});
