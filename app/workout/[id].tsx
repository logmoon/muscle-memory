import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Workout } from '../types';
import { getWorkouts, deleteWorkout, deleteExercise, updateWorkout, deleteSet } from '../utils/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../constants/theme';

export default function WorkoutDetails() {
  const { id } = useLocalSearchParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, [id]);

  const loadWorkout = async () => {
    const workouts = await getWorkouts();
    const found = workouts.find(w => w.id === id);
    setWorkout(found || null);
  };

  const handleDeleteWorkout = async () => {
    if (!workout) return;
    
    const success = await deleteWorkout(workout.id);
    if (success) {
      router.dismissAll();
    } else {
      alert('Failed to delete workout');
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!workout) return;

    const success = await deleteExercise(workout.id, exerciseId);
    if (success) {
      loadWorkout();
    } else {
      alert('Failed to delete exercise');
    }
  };

  const handleDeleteSet = async (exercicdeId: string, setId: number) => {
    if (!workout) return;
    const success = await deleteSet(workout.id, exercicdeId, setId);
    if (success) {
      loadWorkout();
    } else {
      alert('Failed to delete exercise');
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleUpdateWorkout = async () => {
    if (!workout) return;
    const success = await updateWorkout(workout);
    if (success) {
      setIsEditing(false);
    } else {
      alert('Failed to update workout');
    }
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    if (!workout) return;
    const updatedExercises = workout.exercises.map(ex =>
      ex.id === exerciseId ? { ...ex, name } : ex
    );
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    if (!workout) return;
    const updatedExercises = workout.exercises.map(ex =>
      ex.id === exerciseId
        ? {
            ...ex,
            sets: ex.sets.map((set, idx) =>
              idx === setIndex
                ? { ...set, [field]: Number(value) || 0 }
                : set
            ),
          }
        : ex
    );
    setWorkout({ ...workout, exercises: updatedExercises });
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
          {isEditing ? (
            <TextInput
              style={styles.titleInput}
              value={workout.name}
              onChangeText={(name) => setWorkout({ ...workout, name })}
            />
          ) : (
            <Text style={styles.title}>{workout.name}</Text>
          )}
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
            style={[styles.button, isEditing ? styles.saveButton : styles.editButton]}
            onPress={isEditing ? handleUpdateWorkout : () => setIsEditing(true)}
          >
            <Text style={styles.buttonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteWorkout}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Exercises</Text>
      {workout.exercises.map((exercise, index) => (
        <View key={exercise.id} style={styles.exerciseContainer}>
          <View style={styles.exerciseHeader}>
            {isEditing ? (
              <View style={styles.exerciseHeader}>
              <TextInput
                style={styles.exerciseNameInput}
                value={exercise.name}
                onChangeText={(name) => updateExerciseName(exercise.id, name)}
              />
              <TouchableOpacity
                style={styles.deleteExerciseButton}
                onPress={() => handleDeleteExercise(exercise.id)}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.exerciseName}>
                {index + 1}. {exercise.name}
              </Text>
            )}
          </View>

          {exercise.imageUri && (
            <Image
              source={{ uri: exercise.imageUri }}
              style={styles.exerciseImage}
            />
          )}

          {exercise.sets.map((set, setIndex) => (
            <View key={setIndex} style={styles.setContainer}>
              {isEditing ? (
                <View style={styles.setInputContainer}>
                  <TextInput
                    style={styles.setInput}
                    value={set.weight.toString()}
                    onChangeText={(value) => updateSet(exercise.id, setIndex, 'weight', value)}
                    keyboardType="numeric"
                  />
                  <Text style={styles.setText}>kg ×</Text>
                  <TextInput
                    style={styles.setInput}
                    value={set.reps.toString()}
                    onChangeText={(value) => updateSet(exercise.id, setIndex, 'reps', value)}
                    keyboardType="numeric"
                  />
                  <Text style={styles.setText}>reps</Text>
                  <TouchableOpacity
                    style={styles.deleteExerciseButton}
                    onPress={() => handleDeleteSet(exercise.id, setIndex)}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.setText}>
                  Set {setIndex + 1}: {set.weight}kg × {set.reps} reps
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
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