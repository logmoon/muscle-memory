import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { Exercise, Workout } from './types';
import { saveWorkout } from './utils/storage';
import { pickImage, takePhoto } from './utils/imagePicker';

export default function NewWorkout() {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);

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

  const deleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
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
      date: new Date().toISOString(),
      exercises: exercises.map(ex => ({
        ...ex,
        name: ex.name.trim() || 'Unnamed Exercise',
      })),
    };

    const success = await saveWorkout(workout);
    if (success) {
      router.replace('/');
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
      />

      <Text style={styles.sectionTitle}>Exercises</Text>
      {exercises.map((exercise, index) => (
        <View key={exercise.id} style={styles.exerciseContainer}>
          <View style={styles.exerciseHeader}>
            <TextInput
              style={[styles.input, styles.exerciseInput]}
              value={exercise.name}
              onChangeText={(name) => updateExerciseName(exercise.id, name)}
              placeholder={`Exercise ${index + 1} name`}
            />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteExercise(exercise.id)}
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
                <TextInput
                  style={[styles.input, styles.setInput]}
                  value={set.reps.toString()}
                  onChangeText={(value) => updateSet(exercise.id, setIndex, 'reps', value)}
                  placeholder="Reps"
                  keyboardType="numeric"
                />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  exerciseContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
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
    backgroundColor: '#ff4444',
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
    backgroundColor: '#4CAF50',
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
    marginBottom: 5,
  },
  setInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  setInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  addButton: {
    backgroundColor: '#2196F3',
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
    backgroundColor: '#4CAF50',
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});