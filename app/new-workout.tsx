import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { Exercise, Workout } from './types';
import { saveWorkout } from './utils/storage';
import { pickImage, takePhoto } from './utils/imagePicker';
import { COLORS } from './constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import ThemedAlert from './components/ThemedAlert';

export default function NewWorkout() {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutDate, setWorkoutDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteExerciseAlert, setShowDeleteExerciseAlert] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: [{ weight: 0, reps: 0 }],
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExerciseName = (id: string, name: string) => {
    setExercises(exercises.map(ex =>
      ex.id === id ? { ...ex, name } : ex
    ));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: [...ex.sets, { weight: 0, reps: 0 }] }
        : ex
    ));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setExercises(exercises.map(ex =>
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
    ));
  };

  const handleImagePick = async (exerciseId: string) => {
    const imageUri = await pickImage();
    if (imageUri) {
      setExercises(exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, imageUri } : ex
      ));
    }
  };

  const handleTakePhoto = async (exerciseId: string) => {
    const imageUri = await takePhoto();
    if (imageUri) {
      setExercises(exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, imageUri } : ex
      ));
    }
  };

  const confirmDeleteExercise = (exerciseId: string) => {
    setExerciseToDelete(exerciseId);
    setShowDeleteExerciseAlert(true);
  };

  const handleDeleteExercise = () => {
    if (exerciseToDelete) {
      setExercises(exercises.filter(ex => ex.id !== exerciseToDelete));
    }
    setShowDeleteExerciseAlert(false);
    setExerciseToDelete(null);
  };

  const deleteSet = (set: { weight: number; reps: number }) => {
    const updatedExercises = exercises.map(ex => ({
      ...ex,
      sets: ex.sets.filter(s => s !== set),
    }));
    setExercises(updatedExercises);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setWorkoutDate(selectedDate);
    }
  };

  const saveNewWorkout = async () => {
    if (!workoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    if (exercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    const workout: Workout = {
      id: Date.now().toString(),
      name: workoutName.trim(),
      date: workoutDate.toISOString(),
      exercises: exercises.map(ex => ({
        ...ex,
        name: ex.name.trim() || 'Unnamed Exercise',
      })),
    };

    const success = await saveWorkout(workout);
    if (success) {
      router.dismissAll();
    } else {
      alert('Failed to save workout');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Workout Name</Text>
      <TextInput
        style={styles.input}
        value={workoutName}
        onChangeText={setWorkoutName}
        placeholder="Enter workout name"
        placeholderTextColor={COLORS.secondaryText}
      />
      
      <Text style={styles.label}>Workout Date</Text>
      <TouchableOpacity 
        style={styles.dateButton} 
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>
          {workoutDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={workoutDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          themeVariant="dark"
        />
      )}

      <Text style={styles.sectionTitle}>Exercises</Text>
      {exercises.map((exercise, index) => (
        <View key={exercise.id} style={styles.exerciseContainer}>
          <View style={styles.exerciseHeader}>
            <TextInput
              style={[styles.input, styles.exerciseInput]}
              value={exercise.name}
              onChangeText={(name) => updateExerciseName(exercise.id, name)}
              placeholder={`Exercise ${index + 1} name`}
              placeholderTextColor={COLORS.secondaryText}
            />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => confirmDeleteExercise(exercise.id)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.imageButtons}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={() => handleImagePick(exercise.id)}
            >
              <Text style={styles.buttonText}>Pick Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={() => handleTakePhoto(exercise.id)}
            >
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>

          {exercise.imageUri && (
            <Image
              source={{ uri: exercise.imageUri }}
              style={styles.exerciseImage}
            />
          )}

          {exercise.sets.map((set, setIndex) => (
            <View key={setIndex} style={styles.setContainer}>
              <Text style={styles.setText}>Set {setIndex + 1}</Text>
              <View style={styles.setInputContainer}>
                <TextInput
                  style={[styles.input, styles.setInput]}
                  value={set.weight.toString()}
                  onChangeText={(value) => updateSet(exercise.id, setIndex, 'weight', value)}
                  placeholder="Weight (kg)"
                  keyboardType="numeric"
                />
                <Text style={styles.setText}>X</Text>
                <TextInput
                  style={[styles.input, styles.setInput]}
                  value={set.reps.toString()}
                  onChangeText={(value) => updateSet(exercise.id, setIndex, 'reps', value)}
                  placeholder="Reps"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteSet(exercise.sets[setIndex])}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addSet(exercise.id)}
          >
            <Text style={styles.buttonText}>Add Set</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.addButton, styles.addExerciseButton]}
        onPress={addExercise}
      >
        <Text style={styles.buttonText}>Add Exercise</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.addButton, styles.saveButton]}
        onPress={saveNewWorkout}
      >
        <Text style={styles.buttonText}>Save Workout</Text>
      </TouchableOpacity>
      <ThemedAlert
        visible={showDeleteExerciseAlert}
        title="Delete Exercise"
        message="Are you sure you want to delete this exercise?"
        onConfirm={handleDeleteExercise}
        onCancel={() => {
          setShowDeleteExerciseAlert(false);
          setExerciseToDelete(null);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: COLORS.input,
    color: COLORS.inputText,
  },
  dateButton: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  dateButtonText: {
    color: COLORS.text,
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
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseInput: {
    flex: 1,
    marginBottom: 0,
  },
  deleteButton: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.deleteButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  imageButton: {
    flex: 1,
    backgroundColor: COLORS.button,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  setContainer: {
    marginBottom: 10,
  },
  setText: {
    fontSize: 16,
    marginBottom: 10,
    color: COLORS.text,
  },
  setInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  addButton: {
    backgroundColor: COLORS.button,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addExerciseButton: {
    marginTop: 20,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: COLORS.saveButton,
    marginBottom: 30,
  },
  buttonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
});