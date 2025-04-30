import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { Link, useFocusEffect } from 'expo-router';
import { Workout } from './types';
import { getWorkouts } from './utils/storage';
import { COLORS } from './constants/theme';

export default function Home() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load workouts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    const savedWorkouts = await getWorkouts();
    setWorkouts(savedWorkouts);
    setRefreshing(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadWorkouts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <Link href="/new-workout" asChild>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Create New Workout</Text>
        </TouchableOpacity>
      </Link>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/view-workout/${item.id}` as `/view-workout/${string}`} asChild>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  addButton: {
    backgroundColor: COLORS.button,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: COLORS.buttonText,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  workoutItem: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.exerciseCardBorder,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  workoutDate: {
    color: COLORS.secondaryText,
    marginTop: 5,
  },
  exerciseCount: {
    color: COLORS.secondaryText,
    marginTop: 5,
  },
});
