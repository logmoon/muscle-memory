import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout, Exercise } from '../types';

const WORKOUTS_KEY = 'workouts';

export const saveWorkout = async (workout: Workout) => {
  try {
    const existingWorkouts = await getWorkouts();
    const updatedWorkouts = [...existingWorkouts, workout];
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(updatedWorkouts));
    return true;
  } catch (error) {
    console.error('Error saving workout:', error);
    return false;
  }
};

export const getWorkouts = async (): Promise<Workout[]> => {
  try {
    const workouts = await AsyncStorage.getItem(WORKOUTS_KEY);
    return workouts ? JSON.parse(workouts) : [];
  } catch (error) {
    console.error('Error getting workouts:', error);
    return [];
  }
};

export const deleteWorkout = async (workoutId: string) => {
  try {
    const existingWorkouts = await getWorkouts();
    const updatedWorkouts = existingWorkouts.filter(w => w.id !== workoutId);
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(updatedWorkouts));
    return true;
  } catch (error) {
    console.error('Error deleting workout:', error);
    return false;
  }
};

export const deleteExercise = async (workoutId: string, exerciseId: string) => {
  try {
    const existingWorkouts = await getWorkouts();
    const workoutIndex = existingWorkouts.findIndex(w => w.id === workoutId);
    
    if (workoutIndex === -1) return false;
    
    const workout = existingWorkouts[workoutIndex];
    workout.exercises = workout.exercises.filter(e => e.id !== exerciseId);
    existingWorkouts[workoutIndex] = workout;
    
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(existingWorkouts));
    return true;
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return false;
  }
};

export const deleteSet = async (workoutId: string, exerciseId: string, setIndex: number) => {
  try {
    const existingWorkouts = await getWorkouts();
    const workoutIndex = existingWorkouts.findIndex(w => w.id === workoutId);

    if (workoutIndex === -1) return false;

    const workout = existingWorkouts[workoutIndex];
    const exerciseIndex = workout.exercises.findIndex(e => e.id === exerciseId);

    if (exerciseIndex === -1) return false;

    workout.exercises[exerciseIndex].sets.splice(setIndex, 1);
    existingWorkouts[workoutIndex] = workout;

    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(existingWorkouts));
    return true;
  } catch (error) {
    console.error('Error deleting set:', error);
    return false;
  }
};

export const updateWorkout = async (workout: Workout) => {
  try {
    const existingWorkouts = await getWorkouts();
    const workoutIndex = existingWorkouts.findIndex(w => w.id === workout.id);
    
    if (workoutIndex === -1) return false;
    
    existingWorkouts[workoutIndex] = workout;
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(existingWorkouts));
    return true;
  } catch (error) {
    console.error('Error updating workout:', error);
    return false;
  }
};

const storage = {
  saveWorkout,
  getWorkouts,
  deleteWorkout,
  deleteExercise,
  deleteSet,
  updateWorkout,
};

export default storage;