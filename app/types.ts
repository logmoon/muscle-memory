export interface Exercise {
  id: string;
  name: string;
  imageUri?: string;
  sets: Array<{
    weight: number;
    reps: number;
  }>;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
}
