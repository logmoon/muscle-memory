import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Workout } from '../types';
import { getWorkouts, deleteWorkout } from '../utils/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../constants/theme';
import ThemedAlert from '../components/ThemedAlert';

export default function WorkoutDetails() {
  const { id } = useLocalSearchParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteWorkoutAlert, setShowDeleteWorkoutAlert] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, [id]);

  const loadWorkout = async () => {
    const workouts = await getWorkouts();
    const found = workouts.find(w => w.id === id);
    setWorkout(found || null);
  };

  const confirmDeleteWorkout = () => {
    setShowDeleteWorkoutAlert(true);
  };

  const handleDeleteWorkout = async () => {
    if (!workout) return;
    
    const success = await deleteWorkout(workout.id);
    if (success) {
      router.dismissAll();
    } else {
      alert('Failed to delete workout');
    }
    setShowDeleteWorkoutAlert(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate && workout) {
      setWorkout({ ...workout, date: selectedDate.toISOString() });
    }
  };

  if (!workout) {
    return (
      <View style={styles.container}>
        <Text>Workout not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{workout.name}</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.date}>{formatDate(workout.date)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(workout.date)}
              mode="date"
              onChange={handleDateChange}
              themeVariant="dark"
            />
          )}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => router.push(`/edit-workout/${workout.id}`)}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={confirmDeleteWorkout}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Exercises</Text>
      {workout.exercises.map((exercise, index) => (
        <View key={exercise.id} style={styles.exerciseContainer}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseName}>
              {index + 1}. {exercise.name}
            </Text>
          </View>

          {exercise.imageUri && (
            <Image
              source={{ uri: exercise.imageUri }}
              style={styles.exerciseImage}
            />
          )}

          {exercise.sets.map((set, setIndex) => (
            <View key={setIndex} style={styles.setContainer}>
              <Text style={styles.setText}>
                Set {setIndex + 1}: {set.weight}kg × {set.reps} reps
              </Text>
            </View>
          ))}
        </View>
      ))}
      <ThemedAlert
        visible={showDeleteWorkoutAlert}
        title="Delete Workout"
        message="Are you sure you want to delete this workout?"
        onConfirm={handleDeleteWorkout}
        onCancel={() => setShowDeleteWorkoutAlert(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    padding: 5,
    backgroundColor: COLORS.input,
    borderRadius: 5,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  exerciseNameInput: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    padding: 5,
    backgroundColor: COLORS.input,
    borderRadius: 5,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  setInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  setInput: {
    width: 50,
    padding: 5,
    backgroundColor: COLORS.input,
    borderRadius: 5,
    marginHorizontal: 5,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: COLORS.editButton,
  },
  saveButton: {
    backgroundColor: COLORS.saveButton,
  },
  deleteButton: {
    backgroundColor: COLORS.deleteButton,
  },
  buttonText: {
    color: COLORS.buttonText,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.text,
  },
  date: {
    fontSize: 16,
    color: COLORS.secondaryText,
  },
  deleteWorkoutButton: {
    backgroundColor: COLORS.deleteButton,
    padding: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: COLORS.text,
  },
  exerciseContainer: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.exerciseCardBorder,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: COLORS.text,
  },
  deleteExerciseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.deleteButton,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  setContainer: {
    marginBottom: 5,
  },
  setText: {
    fontSize: 16,
    color: COLORS.text,
  },
});