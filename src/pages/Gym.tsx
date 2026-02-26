import { ExerciseImageUpload } from "@/components/gym/ExerciseImageUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import
  {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Flame, Info, Target, Trophy, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

// Get the current day number based on the challenge start date
const getChallengeDay = (startDate: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  // Ensure we're between day 1 and 90
  return Math.max(1, Math.min(90, diffDays + 1));
};

// Get time until midnight for auto-refresh
const getTimeUntilMidnight = (): number => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
};

// Exercise Database with descriptions and images
interface ExerciseInfo {
  name: string;
  description: string;
  instructions: string[];
  musclesWorked: string[];
  imageUrl: string;
}

const exerciseDatabase: Record<string, ExerciseInfo> = {
  // SHOULDERS
  "Low-Pulley Front Raise (Overhand)": {
    name: "Low-Pulley Front Raise (Overhand)",
    description: "Contracts the deltoid, mainly the anterior portion, along with the clavicular head of the pectoralis major and the short head of the biceps brachii to a lesser degree.",
    instructions: [
      "Stand with the feet slightly apart, arms next to the body.",
      "Grasp the handle with an overhand grip with one hand.",
      "Inhale and raise the arm up to eye level.",
      "Exhale at the end of the movement.",
      "Lower slowly and repeat."
    ],
    musclesWorked: ["Anterior Deltoid", "Clavicular Pectoralis Major", "Biceps (Short Head)"],
    imageUrl: ""
  },
  "Low-Pulley Front Raise (Neutral)": {
    name: "Low-Pulley Front Raise (Neutral)",
    description: "Primarily works the anterior deltoid, clavicular part of the pectoralis major, middle deltoid, and short head of the biceps to a lesser extent.",
    instructions: [
      "Stand with legs slightly apart and your arm by your side.",
      "Hold the handle with a neutral (semipronated) grip.",
      "Inhale and raise your arm forward up to eye level.",
      "Exhale at the end of the raise.",
      "Slowly return to the initial position and repeat."
    ],
    musclesWorked: ["Anterior Deltoid", "Middle Deltoid", "Clavicular Pectoralis Major", "Biceps (Short Head)"],
    imageUrl: ""
  },
  "Shoulder Press Machine": {
    name: "Shoulder Press Machine",
    description: "A compound exercise that primarily targets the deltoids while also engaging the triceps and upper chest. The machine provides stability and controlled movement path.",
    instructions: [
      "Sit on the machine with your back flat against the pad.",
      "Grasp the handles at shoulder height with palms facing forward.",
      "Inhale and press the handles overhead until arms are extended.",
      "Exhale at the top of the movement.",
      "Lower the weight slowly back to shoulder level."
    ],
    musclesWorked: ["Anterior Deltoid", "Middle Deltoid", "Triceps", "Upper Chest"],
    imageUrl: ""
  },
  "Lateral Raise Machine": {
    name: "Lateral Raise Machine",
    description: "Isolates the middle deltoid, creating width in the shoulders. The machine provides consistent resistance throughout the range of motion.",
    instructions: [
      "Sit on the machine with arms at your sides against the pads.",
      "Keep a slight bend in your elbows throughout the movement.",
      "Inhale and raise your arms out to the sides until parallel to the floor.",
      "Hold briefly at the top, then exhale.",
      "Lower slowly with control back to starting position."
    ],
    musclesWorked: ["Middle Deltoid", "Anterior Deltoid", "Trapezius"],
    imageUrl: ""
  },
  "Rear Delt Machine": {
    name: "Rear Delt Machine",
    description: "Targets the posterior deltoid and upper back muscles. Essential for balanced shoulder development and improved posture.",
    instructions: [
      "Sit facing the machine with chest against the pad.",
      "Grasp the handles with arms extended in front.",
      "Inhale and pull the handles back in an arc motion.",
      "Squeeze your shoulder blades together at the end.",
      "Exhale and slowly return to the starting position."
    ],
    musclesWorked: ["Posterior Deltoid", "Rhomboids", "Middle Trapezius"],
    imageUrl: ""
  },
  "Front Raise Machine": {
    name: "Front Raise Machine",
    description: "Isolates the anterior deltoid for front shoulder development. Provides controlled resistance for precise targeting.",
    instructions: [
      "Sit or stand at the machine with arms positioned on the pads.",
      "Start with arms at your sides or slightly behind.",
      "Inhale and raise your arms forward to shoulder height.",
      "Keep arms straight or with a slight bend.",
      "Lower slowly while exhaling."
    ],
    musclesWorked: ["Anterior Deltoid", "Upper Pectoralis Major", "Serratus Anterior"],
    imageUrl: ""
  },
  "Upright Row Machine": {
    name: "Upright Row Machine",
    description: "Compound movement targeting the deltoids and trapezius. Builds shoulder width and upper back thickness.",
    instructions: [
      "Stand at the machine with a shoulder-width grip on the bar.",
      "Keep the bar close to your body throughout the movement.",
      "Inhale and pull the bar up towards your chin.",
      "Lead with your elbows, raising them higher than your hands.",
      "Lower slowly while exhaling."
    ],
    musclesWorked: ["Middle Deltoid", "Anterior Deltoid", "Trapezius", "Biceps"],
    imageUrl: ""
  },

  // CHEST
  "Chest Press Machine": {
    name: "Chest Press Machine",
    description: "Primary compound movement for chest development. Targets the pectoralis major with secondary activation of triceps and anterior deltoids.",
    instructions: [
      "Sit with back firmly against the pad, feet flat on floor.",
      "Grasp handles at chest level with overhand grip.",
      "Inhale and press the handles forward until arms are extended.",
      "Keep a slight bend in elbows at full extension.",
      "Exhale and slowly return to starting position."
    ],
    musclesWorked: ["Pectoralis Major", "Anterior Deltoid", "Triceps"],
    imageUrl: ""
  },
  "Incline Chest Press Machine": {
    name: "Incline Chest Press Machine",
    description: "Emphasizes the upper portion of the pectoralis major. The inclined angle shifts focus to the clavicular head of the chest.",
    instructions: [
      "Sit on the inclined seat with back against the pad.",
      "Position handles at upper chest level.",
      "Inhale and press upward and forward until arms extend.",
      "Maintain control throughout the movement.",
      "Exhale and lower slowly back to start."
    ],
    musclesWorked: ["Upper Pectoralis Major", "Anterior Deltoid", "Triceps"],
    imageUrl: ""
  },
  "Decline Chest Press Machine": {
    name: "Decline Chest Press Machine",
    description: "Targets the lower portion of the pectoralis major. The decline angle emphasizes the sternal head of the chest.",
    instructions: [
      "Position yourself on the decline bench with feet secured.",
      "Grasp the handles at lower chest level.",
      "Inhale and press forward and slightly downward.",
      "Extend arms fully with control.",
      "Exhale and return slowly to starting position."
    ],
    musclesWorked: ["Lower Pectoralis Major", "Triceps", "Anterior Deltoid"],
    imageUrl: ""
  },
  "Pec Fly Machine": {
    name: "Pec Fly Machine",
    description: "Isolation exercise for the pectoralis major. Provides a deep stretch and strong contraction for chest development.",
    instructions: [
      "Sit with back against pad, arms positioned on the pads.",
      "Start with arms spread wide, slight bend in elbows.",
      "Inhale and bring your arms together in front of chest.",
      "Squeeze your chest muscles at the center.",
      "Exhale and slowly return to the stretched position."
    ],
    musclesWorked: ["Pectoralis Major", "Anterior Deltoid"],
    imageUrl: ""
  },
  "Cable Crossover Machine": {
    name: "Cable Crossover Machine",
    description: "Versatile chest exercise allowing multiple angles of attack. Provides constant tension throughout the movement.",
    instructions: [
      "Stand in the center of the cable station.",
      "Grasp high pulleys with arms spread wide.",
      "Step forward slightly and lean forward at the hips.",
      "Inhale and bring hands together in a hugging motion.",
      "Exhale, squeeze chest, then slowly return to start."
    ],
    musclesWorked: ["Pectoralis Major", "Anterior Deltoid", "Biceps"],
    imageUrl: ""
  },

  // BACK
  "Lat Pulldown Machine (Wide)": {
    name: "Lat Pulldown Machine (Wide)",
    description: "Primary back builder targeting the latissimus dorsi. Wide grip emphasizes the outer lats for a wider back appearance.",
    instructions: [
      "Sit with thighs secured under the pads.",
      "Grasp the bar with a wide overhand grip.",
      "Inhale and pull the bar down to upper chest.",
      "Squeeze your shoulder blades together at the bottom.",
      "Exhale and slowly extend arms back to start."
    ],
    musclesWorked: ["Latissimus Dorsi", "Biceps", "Rear Deltoid", "Rhomboids"],
    imageUrl: ""
  },
  "Lat Pulldown Machine (Close)": {
    name: "Lat Pulldown Machine (Close)",
    description: "Targets the inner lats and mid-back. Close grip allows for greater range of motion and bicep involvement.",
    instructions: [
      "Sit with thighs secured under the pads.",
      "Grasp the close-grip handle or V-bar attachment.",
      "Inhale and pull down to upper chest level.",
      "Keep elbows close to your body throughout.",
      "Exhale and control the weight back up."
    ],
    musclesWorked: ["Latissimus Dorsi", "Biceps", "Lower Trapezius", "Rhomboids"],
    imageUrl: ""
  },
  "Seated Row Machine": {
    name: "Seated Row Machine",
    description: "Compound back exercise for thickness. Targets the middle back, lats, and biceps with a horizontal pulling motion.",
    instructions: [
      "Sit with chest against pad, feet on platform.",
      "Grasp handles with neutral or overhand grip.",
      "Inhale and pull handles towards your midsection.",
      "Squeeze shoulder blades together at full contraction.",
      "Exhale and extend arms with control."
    ],
    musclesWorked: ["Latissimus Dorsi", "Rhomboids", "Trapezius", "Biceps", "Rear Deltoid"],
    imageUrl: ""
  },
  "Back Extension Machine": {
    name: "Back Extension Machine",
    description: "Strengthens the erector spinae and lower back. Essential for spinal health and core stability.",
    instructions: [
      "Position yourself with hips on the pad, ankles secured.",
      "Cross arms over chest or behind head.",
      "Lower your torso by bending at the hips.",
      "Inhale and raise your torso until body is straight.",
      "Do not hyperextend; stop when body is aligned."
    ],
    musclesWorked: ["Erector Spinae", "Gluteus Maximus", "Hamstrings"],
    imageUrl: ""
  },
  "T-Bar Row Machine": {
    name: "T-Bar Row Machine",
    description: "Heavy compound movement for back thickness. Allows significant loading for strength and mass development.",
    instructions: [
      "Stand on the platform with feet shoulder-width apart.",
      "Bend at hips and grasp the handles.",
      "Keep back flat and core engaged throughout.",
      "Inhale and pull the weight towards your chest.",
      "Squeeze at the top, then lower with control."
    ],
    musclesWorked: ["Latissimus Dorsi", "Rhomboids", "Trapezius", "Biceps", "Erector Spinae"],
    imageUrl: ""
  },

  // LEGS
  "Leg Press Machine": {
    name: "Leg Press Machine",
    description: "Compound lower body exercise for quadriceps, hamstrings, and glutes. Allows heavy loading with reduced spinal stress.",
    instructions: [
      "Sit on the machine with back flat against the pad.",
      "Place feet shoulder-width apart on the platform.",
      "Release the safety and lower the weight by bending knees.",
      "Lower until knees reach 90 degrees.",
      "Press through heels to extend legs, don't lock knees."
    ],
    musclesWorked: ["Quadriceps", "Gluteus Maximus", "Hamstrings", "Calves"],
    imageUrl: ""
  },
  "Leg Extension Machine": {
    name: "Leg Extension Machine",
    description: "Isolation exercise for the quadriceps. Targets all four heads of the quadriceps muscle group.",
    instructions: [
      "Sit with back against pad, ankles behind the roller.",
      "Adjust the pad to sit just above your ankles.",
      "Grasp the handles for stability.",
      "Inhale and extend legs until straight.",
      "Squeeze quads at top, then lower slowly."
    ],
    musclesWorked: ["Quadriceps (All Four Heads)"],
    imageUrl: ""
  },
  "Leg Curl Machine": {
    name: "Leg Curl Machine",
    description: "Isolation exercise for the hamstrings. Essential for balanced leg development and knee health.",
    instructions: [
      "Lie face down or sit on the machine as designed.",
      "Position ankles under or above the roller pad.",
      "Grasp handles for stability.",
      "Inhale and curl your heels towards your glutes.",
      "Squeeze hamstrings at full contraction, then lower slowly."
    ],
    musclesWorked: ["Hamstrings", "Gastrocnemius"],
    imageUrl: ""
  },
  "Calf Raise Machine": {
    name: "Calf Raise Machine",
    description: "Isolation exercise for calf development. Targets both the gastrocnemius and soleus muscles.",
    instructions: [
      "Position shoulders under the pads, balls of feet on platform.",
      "Start with heels dropped below platform level.",
      "Inhale and raise up onto your toes as high as possible.",
      "Squeeze calves at the top of the movement.",
      "Lower slowly to full stretch and repeat."
    ],
    musclesWorked: ["Gastrocnemius", "Soleus"],
    imageUrl: ""
  },
  "Hack Squat Machine": {
    name: "Hack Squat Machine",
    description: "Compound leg exercise emphasizing the quadriceps. Provides stability while allowing deep squatting motion.",
    instructions: [
      "Position yourself on the machine with shoulders under pads.",
      "Place feet shoulder-width apart on the platform.",
      "Release the safety and lower by bending knees.",
      "Descend until thighs are parallel to platform.",
      "Press through heels to return to starting position."
    ],
    musclesWorked: ["Quadriceps", "Gluteus Maximus", "Hamstrings"],
    imageUrl: ""
  },
  "Adductor Machine": {
    name: "Adductor Machine",
    description: "Isolation exercise for the inner thigh muscles. Strengthens the adductor group for leg stability and aesthetics.",
    instructions: [
      "Sit on the machine with legs spread on the pads.",
      "Adjust the range of motion as needed.",
      "Grasp handles for stability.",
      "Inhale and squeeze legs together against resistance.",
      "Hold briefly, then slowly return to starting position."
    ],
    musclesWorked: ["Adductor Magnus", "Adductor Longus", "Adductor Brevis", "Gracilis"],
    imageUrl: ""
  },
  "Abductor Machine": {
    name: "Abductor Machine",
    description: "Isolation exercise for the outer thigh and hip muscles. Strengthens the abductors for hip stability.",
    instructions: [
      "Sit on the machine with legs together on the inside of pads.",
      "Adjust the starting position as needed.",
      "Grasp handles for stability.",
      "Inhale and push legs apart against resistance.",
      "Hold briefly at full extension, then return slowly."
    ],
    musclesWorked: ["Gluteus Medius", "Gluteus Minimus", "Tensor Fasciae Latae"],
    imageUrl: ""
  }
};

// Get exercise info from database, fallback to generic if not found
const getExerciseInfo = (exerciseName: string): ExerciseInfo => {
  return exerciseDatabase[exerciseName] || {
    name: exerciseName,
    description: `A targeted exercise for muscle development and strength.`,
    instructions: [
      "Set up the machine according to your body size.",
      "Perform the movement with controlled motion.",
      "Focus on muscle contraction throughout.",
      "Breathe properly - exhale on exertion.",
      "Return to starting position with control."
    ],
    musclesWorked: ["Target Muscle Group"],
    imageUrl: "/exercises/default-exercise.png"
  };
};

// 90-Day Workout Challenge - Each day is unique with date-based seed
const generate90DayPlan = () => {
  const exercises = {
    chest: [
      "Chest Press Machine", "Incline Chest Press Machine", "Decline Chest Press Machine", 
      "Pec Fly Machine", "Cable Crossover Machine"
    ],
    back: [
      "Lat Pulldown Machine (Wide)", "Lat Pulldown Machine (Close)", "Seated Row Machine",
      "Back Extension Machine", "T-Bar Row Machine"
    ],
    shoulders: [
      "Shoulder Press Machine", "Lateral Raise Machine", "Rear Delt Machine",
      "Front Raise Machine", "Upright Row Machine", "Low-Pulley Front Raise (Overhand)", 
      "Low-Pulley Front Raise (Neutral)"
    ],
    legs: [
      "Leg Press Machine", "Leg Extension Machine", "Leg Curl Machine",
      "Calf Raise Machine", "Hack Squat Machine", "Adductor Machine", "Abductor Machine"
    ]
  };

  const workoutTemplates = [
    { name: "Chest & Shoulders", groups: ["chest", "shoulders"], exercisesCount: [3, 2] },
    { name: "Back & Legs", groups: ["back", "legs"], exercisesCount: [3, 3] },
    { name: "Shoulders & Chest", groups: ["shoulders", "chest"], exercisesCount: [3, 2] },
    { name: "Legs Focus", groups: ["legs"], exercisesCount: [5] },
    { name: "Back Focus", groups: ["back"], exercisesCount: [4] },
    { name: "Chest Focus", groups: ["chest"], exercisesCount: [4] },
    { name: "Upper Body", groups: ["chest", "back", "shoulders"], exercisesCount: [2, 2, 2] },
  ];

  const plan = [];
  
  for (let day = 1; day <= 90; day++) {
    const phase = day <= 30 ? 1 : day <= 60 ? 2 : 3;
    const template = workoutTemplates[(day - 1) % workoutTemplates.length];
    
    interface Exercise {
      id: number;
      name: string;
      sets: string;
      reps: string;
      muscleGroup: string;
      rest: string;
      description: string;
      instructions: string[];
      musclesWorked: string[];
      imageUrl: string;
    }
    const dayExercises: Exercise[] = [];
    let exerciseId = (day - 1) * 6 + 1;

    template.groups.forEach((group, groupIndex) => {
      const groupExercises = exercises[group as keyof typeof exercises];
      const count = template.exercisesCount[groupIndex];
      
      for (let i = 0; i < count; i++) {
        const exerciseIndex = ((day - 1) + i) % groupExercises.length;
        const sets = phase === 1 ? 3 : phase === 2 ? 4 : 4;
        const reps = phase === 1 ? "12-15" : phase === 2 ? "10-12" : "8-12";
        const rest = phase === 1 ? "60s" : phase === 2 ? "75s" : "90s";
        const exerciseName = groupExercises[exerciseIndex];
        const exerciseInfo = getExerciseInfo(exerciseName);
        
        dayExercises.push({
          id: exerciseId++,
          name: exerciseName,
          sets: `${sets} sets`,
          reps: `${reps} reps`,
          muscleGroup: group.charAt(0).toUpperCase() + group.slice(1),
          rest,
          description: exerciseInfo.description,
          instructions: exerciseInfo.instructions,
          musclesWorked: exerciseInfo.musclesWorked,
          imageUrl: exerciseInfo.imageUrl
        });
      }
    });

    plan.push({
      day,
      phase,
      name: template.name,
      exercises: dayExercises,
      phaseLabel: phase === 1 ? "Foundation" : phase === 2 ? "Strength" : "Hypertrophy"
    });
  }
  
  return plan;
};

const workoutPlan = generate90DayPlan();

type Exercise = {
  id: number;
  name: string;
  sets: string;
  reps: string;
  muscleGroup: string;
  rest: string;
  description?: string;
  instructions?: string[];
  musclesWorked?: string[];
  imageUrl?: string;
};

const Gym = () => {
  const [completed, setCompleted] = useState<number[]>([]);
  const [challengeStartDate, setChallengeStartDate] = useState<Date | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomWorkout, setShowCustomWorkout] = useState(false);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [userCustomImages, setUserCustomImages] = useState<Record<string, string>>({});
  const [savedWorkouts, setSavedWorkouts] = useState<Array<{
    id: string;
    name: string;
    exercises: Exercise[];
  }>>([]);
  const [currentWorkoutName, setCurrentWorkoutName] = useState("");
  const [currentWorkoutId, setCurrentWorkoutId] = useState<string | null>(null);
  const [, setForceUpdate] = useState(0); // For midnight refresh
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const { toast } = useToast();

  // Calculate current day based on challenge start date
  const currentDay = useMemo(() => {
    if (!challengeStartDate) return 1;
    return getChallengeDay(challengeStartDate);
  }, [challengeStartDate]);

  const currentWorkout = workoutPlan[currentDay - 1];

  // Set up midnight refresh timer
  useEffect(() => {
    const scheduleNextDayRefresh = () => {
      const timeUntilMidnight = getTimeUntilMidnight();
      console.log(`Next workout update in ${Math.round(timeUntilMidnight / 1000 / 60)} minutes`);
      
      const timerId = setTimeout(() => {
        console.log("Midnight reached - refreshing workout for new day");
        setForceUpdate(prev => prev + 1);
        setCompleted([]); // Reset completed exercises for new day
        toast({
          title: "New Day, New Workout! 🌅",
          description: `Day ${currentDay + 1} workout is now available`,
        });
        // Schedule the next midnight refresh
        scheduleNextDayRefresh();
      }, timeUntilMidnight);

      return timerId;
    };

    const timerId = scheduleNextDayRefresh();
    return () => clearTimeout(timerId);
  }, [currentDay, toast]);

  const fetchChallengeProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user logged in");
        // Set default start date to today for non-logged users
        setChallengeStartDate(new Date());
        setLoading(false);
        return;
      }

      console.log("Fetching challenge progress for user:", user.id);

      // Fetch gym challenge progress
      const { data, error } = await supabase
        .from("gym_challenge_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching progress:", error);
        throw error;
      }

      if (data) {
        console.log("Progress data loaded:", data);
        // Use the challenge start date from the database, or created_at as fallback
        const startDate = data.challenge_start_date 
          ? new Date(data.challenge_start_date)
          : data.created_at 
            ? new Date(data.created_at) 
            : new Date();
        setChallengeStartDate(startDate);
        setCompletedDays(data.completed_days || []);
      } else {
        console.log("No existing progress found, starting fresh");
        // Start a new challenge from today
        const today = new Date();
        setChallengeStartDate(today);
        
        // Create initial progress record with start date
        const { error: insertError } = await supabase
          .from("gym_challenge_progress")
          .insert({
            user_id: user.id,
            current_day: 1,
            completed_days: [],
            challenge_start_date: today.toISOString(),
          });
        
        if (insertError) {
          console.error("Error creating initial progress:", insertError);
        }
      }
    } catch (error: unknown) {
      console.error("Error fetching challenge progress:", error);
      setChallengeStartDate(new Date()); // Fallback to today
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedWorkouts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("custom_workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching saved workouts:", error);
        return;
      }

      if (data) {
        setSavedWorkouts(data.map(w => ({
          id: w.id,
          name: w.name,
          exercises: w.exercises as Exercise[]
        })));
      }
    } catch (error: unknown) {
      console.error("Error in fetchSavedWorkouts:", error);
    }
  };

  const fetchUserCustomImages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_exercise_images")
        .select("exercise_name, image_url")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching custom images:", error);
        return;
      }

      if (data) {
        const imageMap: Record<string, string> = {};
        data.forEach(item => {
          imageMap[item.exercise_name] = item.image_url;
        });
        setUserCustomImages(imageMap);
      }
    } catch (error: unknown) {
      console.error("Error in fetchUserCustomImages:", error);
    }
  };

  const handleImageUploaded = useCallback((exerciseName: string, imageUrl: string) => {
    setUserCustomImages(prev => ({
      ...prev,
      [exerciseName]: imageUrl
    }));
    
    // Update selected exercise if it matches
    if (selectedExercise?.name === exerciseName) {
      setSelectedExercise(prev => prev ? { ...prev, imageUrl } : null);
    }
  }, [selectedExercise?.name]);

  const handleImageRemoved = useCallback((exerciseName: string) => {
    setUserCustomImages(prev => {
      const newImages = { ...prev };
      delete newImages[exerciseName];
      return newImages;
    });

    // Reset to default image if this exercise is selected
    if (selectedExercise?.name === exerciseName) {
      const defaultInfo = getExerciseInfo(exerciseName);
      setSelectedExercise(prev => prev ? { ...prev, imageUrl: defaultInfo.imageUrl } : null);
    }
  }, [selectedExercise?.name]);

  useEffect(() => {
    fetchChallengeProgress();
    fetchSavedWorkouts();
    fetchUserCustomImages();
  }, []);

  const saveProgress = async (day: number, completedList: number[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in");

      const { error } = await supabase
        .from("gym_challenge_progress")
        .upsert({
          user_id: user.id,
          current_day: day,
          completed_days: completedList,
          challenge_start_date: challengeStartDate?.toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error: unknown) {
      console.error("Error saving progress:", error);
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive",
      });
    }
  };

  const saveCustomWorkout = async () => {
    if (customExercises.length === 0) {
      toast({
        title: "No exercises to save",
        description: "Add exercises before saving",
        variant: "destructive",
      });
      return;
    }

    if (!currentWorkoutName.trim()) {
      toast({
        title: "Workout name required",
        description: "Please enter a name for your workout",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in");

      if (currentWorkoutId) {
        // Update existing workout
        const { error } = await supabase
          .from("custom_workouts")
          .update({
            name: currentWorkoutName,
            exercises: customExercises,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentWorkoutId);

        if (error) throw error;

        toast({
          title: "Workout Updated!",
          description: `${currentWorkoutName} has been updated`,
        });
      } else {
        // Create new workout
        const { error } = await supabase
          .from("custom_workouts")
          .insert({
            user_id: user.id,
            name: currentWorkoutName,
            exercises: customExercises,
          });

        if (error) throw error;

        toast({
          title: "Workout Saved!",
          description: `${currentWorkoutName} has been saved`,
        });
      }

      await fetchSavedWorkouts();
    } catch (error: unknown) {
      console.error("Error saving workout:", error);
      toast({
        title: "Error",
        description: "Failed to save workout",
        variant: "destructive",
      });
    }
  };

  const loadCustomWorkout = (workout: { id: string; name: string; exercises: Exercise[] }) => {
    setCustomExercises(workout.exercises);
    setCurrentWorkoutName(workout.name);
    setCurrentWorkoutId(workout.id);
    setCompleted([]);
    toast({
      title: "Workout Loaded!",
      description: `${workout.name} is ready`,
    });
  };

  const deleteCustomWorkout = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from("custom_workouts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Workout Deleted",
        description: `${name} has been removed`,
      });

      if (currentWorkoutId === id) {
        setCustomExercises([]);
        setCurrentWorkoutName("");
        setCurrentWorkoutId(null);
        setCompleted([]);
      }

      await fetchSavedWorkouts();
    } catch (error: unknown) {
      console.error("Error deleting workout:", error);
      toast({
        title: "Error",
        description: "Failed to delete workout",
        variant: "destructive",
      });
    }
  };

  const startNewCustomWorkout = () => {
    setCustomExercises([]);
    setCurrentWorkoutName("");
    setCurrentWorkoutId(null);
    setCompleted([]);
  };

  const toggleComplete = (id: number) => {
    setCompleted(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const completeWorkout = async () => {
    if (completed.length !== currentWorkout.exercises.length) {
      toast({
        title: "Incomplete Workout",
        description: "Please complete all exercises before finishing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your progress",
          variant: "destructive",
        });
        return;
      }

      // Check if already completed today
      if (completedDays.includes(currentDay)) {
        toast({
          title: "Already Completed",
          description: `You've already completed Day ${currentDay}. Come back tomorrow for a new workout!`,
        });
        return;
      }

      // Update challenge progress
      const newCompletedDays = [...completedDays, currentDay];

      console.log("Saving challenge progress:", {
        user_id: user.id,
        current_day: currentDay,
        completed_days: newCompletedDays,
      });

      const { error: progressError } = await supabase
        .from("gym_challenge_progress")
        .upsert({
          user_id: user.id,
          current_day: currentDay,
          completed_days: newCompletedDays,
          challenge_start_date: challengeStartDate?.toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (progressError) {
        console.error("Progress error:", progressError);
        throw progressError;
      }

      console.log("Challenge progress saved successfully!");

      // Save workout to history
      const { error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          workout_type: "gym",
          duration: 60,
          notes: `Day ${currentDay}: ${currentWorkout.name}`,
        });

      if (workoutError) {
        console.error("Workout history error:", workoutError);
        // Don't throw - workout history is secondary
      }

      // Update local state
      setCompletedDays(newCompletedDays);
      setCompleted([]);

      const isChallengeDone = currentDay === 90;
      toast({
        title: "Workout Complete! 🎉",
        description: isChallengeDone 
          ? "Congratulations! You've completed the 90-day challenge!" 
          : `Day ${currentDay} done! Come back tomorrow for Day ${currentDay + 1}!`,
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Complete workout error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to save workout progress",
        variant: "destructive",
      });
    }
  };

  const getMuscleGroupColor = (muscleGroup: string) => {
    switch (muscleGroup) {
      case "Chest": return "bg-primary/20 text-primary border-primary/30";
      case "Back": return "bg-success/20 text-success border-success/30";
      case "Shoulders": return "bg-info/20 text-info border-info/30";
      case "Legs": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-muted border-border";
    }
  };

  const calculateProgress = () => {
    const totalExercises = currentWorkout.exercises.length;
    const completedExercises = currentWorkout.exercises.filter(ex => completed.includes(ex.id)).length;
    return Math.round((completedExercises / totalExercises) * 100);
  };

  const getStreak = () => {
    if (completedDays.length === 0) return 0;
    const sorted = [...completedDays].sort((a, b) => b - a);
    let streak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i] - sorted[i + 1] === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  if (loading) {
    return <LoadingSpinner message="Loading challenge..." />;
  }

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        <header className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent text-center flex-1">
            <span className="hidden sm:inline">{showCustomWorkout ? "Custom Workout" : "90-Day Challenge"}</span>
            <span className="sm:hidden">{showCustomWorkout ? "Custom" : "90-Day"}</span>
          </h1>
          <Button 
            variant={showCustomWorkout ? "default" : "secondary"}
            size="sm"
            onClick={() => {
              setShowCustomWorkout(!showCustomWorkout);
              setCompleted([]);
            }}
            className="transition-all duration-300 active:scale-95 sm:hover:scale-105 flex-shrink-0 shadow-sm bg-opacity-100 h-10 px-3 sm:px-4"
          >
            <span className="hidden sm:inline">{showCustomWorkout ? "90-Day Challenge" : "Custom Workout"}</span>
            <span className="sm:hidden">{showCustomWorkout ? "90-Day" : "Custom"}</span>
          </Button>
        </header>

        {showCustomWorkout ? (
          <CustomWorkoutBuilder 
            customExercises={customExercises}
            setCustomExercises={setCustomExercises}
            completed={completed}
            toggleComplete={toggleComplete}
            calculateProgress={() => {
              if (customExercises.length === 0) return 0;
              return Math.round((completed.length / customExercises.length) * 100);
            }}
            getMuscleGroupColor={getMuscleGroupColor}
            saveCustomWorkout={saveCustomWorkout}
            loadCustomWorkout={loadCustomWorkout}
            deleteCustomWorkout={deleteCustomWorkout}
            startNewCustomWorkout={startNewCustomWorkout}
            savedWorkouts={savedWorkouts}
            currentWorkoutName={currentWorkoutName}
            setCurrentWorkoutName={setCurrentWorkoutName}
            currentWorkoutId={currentWorkoutId}
          />
        ) : (
          <>
        {/* Challenge Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm border-2 border-border/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-muted-foreground">Current Day</div>
                <div className="text-2xl sm:text-3xl font-bold text-primary">{currentDay}/90</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm border-2 border-border/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl sm:text-3xl font-bold text-success">{completedDays.length}</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm border-2 border-border/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-energy/20 flex items-center justify-center flex-shrink-0">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-energy" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Streak</div>
                <div className="text-3xl font-bold text-energy">{getStreak()} 🔥</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Day Info */}
        <Card className="p-3 sm:p-4 mb-4 sm:mb-6 bg-card/90 backdrop-blur-sm border border-border/50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
            <div className="text-center sm:text-left">
              <div className="text-xs text-muted-foreground">Today's Date</div>
              <div className="text-sm sm:text-base font-semibold">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <Badge variant="outline" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 text-center">
              Phase {currentWorkout.phase}: {currentWorkout.phaseLabel}
            </Badge>
            <div className="text-center sm:text-right">
              <div className="text-xs text-muted-foreground">New workout at</div>
              <div className="text-sm sm:text-base font-semibold text-primary">00:00 midnight</div>
            </div>
          </div>
        </Card>

        {/* Progress Card */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm border-2 border-border/50 glow-effect-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 sm:mb-4">
            <div className="flex-1">
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">Day {currentDay}: {currentWorkout.name}</div>
              <div className="text-2xl sm:text-3xl font-bold text-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                {currentWorkout.exercises.filter((ex: { id: number }) => completed.includes(ex.id)).length}/{currentWorkout.exercises.length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Exercises Completed</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl sm:text-5xl font-bold text-success drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                {calculateProgress()}%
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Progress</div>
            </div>
          </div>
          
          {completedDays.includes(currentDay) && (
            <Badge className="bg-success/20 text-success border-success/30 mb-4">
              ✓ Completed
            </Badge>
          )}
        </Card>

        {/* Exercise List */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {currentWorkout.exercises.map((exercise) => {
            const isCompleted = completed.includes(exercise.id);
            // Get custom image or default from exercise info
            const exerciseImageUrl = userCustomImages[exercise.name] || exercise.imageUrl;
            
            return (
              <Card 
                key={exercise.id}
                className={`overflow-hidden transition-all duration-500 border-2 card-lift ${
                  isCompleted 
                    ? 'bg-primary/5 border-primary/50 glow-effect-sm' 
                    : 'bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30'
                }`}
              >
                <div className="flex">
                  {/* Exercise Image Thumbnail */}
                  <div 
                    className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 cursor-pointer"
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    {exerciseImageUrl ? (
                      <img 
                        src={exerciseImageUrl} 
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/70 ${exerciseImageUrl ? 'hidden' : 'flex'}`}
                    >
                      <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary/60" />
                      <span className="text-[8px] sm:text-[10px] text-muted-foreground mt-1 text-center px-1">
                        {exercise.muscleGroup}
                      </span>
                    </div>
                    {/* Completed overlay */}
                    {isCompleted && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>

                  {/* Exercise Details */}
                  <div className="flex-1 p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                    <div 
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 cursor-pointer ${
                        isCompleted ? 'bg-primary scale-110' : 'bg-muted hover:scale-105'
                      }`}
                      onClick={() => toggleComplete(exercise.id)}
                    >
                      <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${isCompleted ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleComplete(exercise.id)}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm sm:text-lg font-bold truncate">{exercise.name}</h3>
                        <Badge className={`text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5 flex-shrink-0 ${getMuscleGroupColor(exercise.muscleGroup)}`}>
                          {exercise.muscleGroup}
                        </Badge>
                      </div>
                      <div className="flex gap-2 sm:gap-3 text-[10px] sm:text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {exercise.sets}
                        </span>
                        <span>•</span>
                        <span>{exercise.reps}</span>
                        <span>•</span>
                        <span>Rest: {exercise.rest}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 hover:bg-info/20 hover:text-info h-8 w-8 sm:h-10 sm:w-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExercise(exercise);
                      }}
                    >
                      <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Exercise Detail Modal */}
        <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedExercise && (() => {
              // Get custom image if available, otherwise use default
              const displayImageUrl = userCustomImages[selectedExercise.name] || selectedExercise.imageUrl;
              
              return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-primary">
                    {selectedExercise.name}
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    {selectedExercise.description}
                  </DialogDescription>
                </DialogHeader>
                
                {/* Exercise Image */}
                <div className="relative w-full h-48 sm:h-64 bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden border border-border">
                  {displayImageUrl ? (
                    <img 
                      src={displayImageUrl} 
                      alt={selectedExercise.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 ${displayImageUrl ? 'hidden' : 'flex'}`}
                  >
                    <div className="w-16 h-16 mb-2 rounded-full bg-primary/20 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-muted-foreground text-sm font-medium">{selectedExercise.muscleGroup} Exercise</span>
                  </div>
                </div>

                {/* Image Upload */}
                <ExerciseImageUpload
                  exerciseName={selectedExercise.name}
                  currentImageUrl={userCustomImages[selectedExercise.name]}
                  onImageUploaded={(url) => handleImageUploaded(selectedExercise.name, url)}
                  onImageRemoved={() => handleImageRemoved(selectedExercise.name)}
                />

                <div className="space-y-4">
                  {/* Muscles Worked */}
                  {selectedExercise.musclesWorked && selectedExercise.musclesWorked.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-foreground">Muscles Worked</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedExercise.musclesWorked.map((muscle, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary">
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  {selectedExercise.instructions && selectedExercise.instructions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-foreground">Instructions</h4>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        {selectedExercise.instructions.map((instruction, idx) => (
                          <li key={idx} className="text-sm">{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Sets & Reps */}
                  <div className="flex gap-4 pt-2">
                    <div className="flex-1 text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{selectedExercise.sets}</div>
                      <div className="text-xs text-muted-foreground">Sets</div>
                    </div>
                    <div className="flex-1 text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{selectedExercise.reps}</div>
                      <div className="text-xs text-muted-foreground">Reps</div>
                    </div>
                    <div className="flex-1 text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{selectedExercise.rest}</div>
                      <div className="text-xs text-muted-foreground">Rest</div>
                    </div>
                  </div>
                </div>
              </>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Complete Workout Button */}
        {!completedDays.includes(currentDay) && (
          <Button
            onClick={completeWorkout}
            disabled={completed.length !== currentWorkout.exercises.length}
            className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold active:scale-95 sm:hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl mb-4 sm:mb-6"
          >
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Complete Day {currentDay}
          </Button>
        )}

        {/* Training Tips */}
        <Card className="p-4 sm:p-6 bg-card/90 backdrop-blur-sm border border-info/30 shadow-lg">
          <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-info flex-shrink-0" />
            <span className="truncate">Training Tips for {currentWorkout.phaseLabel} Phase</span>
          </h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">{currentWorkout.phase === 1 && (
              <>
                <li>• Focus on proper form and controlled movements</li>
                <li>• Start with lighter weights to establish technique</li>
                <li>• Complete all reps with full range of motion</li>
                <li>• Rest 60-90 seconds between sets</li>
              </>
            )}
            {currentWorkout.phase === 2 && (
              <>
                <li>• Increase weight by 5-10% when you can complete all reps easily</li>
                <li>• Focus on mind-muscle connection</li>
                <li>• Maintain strict form even with heavier weights</li>
                <li>• Ensure adequate protein intake (1.6-2.2g per kg bodyweight)</li>
              </>
            )}
            {currentWorkout.phase === 3 && (
              <>
                <li>• Incorporate drop sets on final set of each exercise</li>
                <li>• Focus on time under tension (2-3 seconds eccentric)</li>
                <li>• Increase training volume with additional sets</li>
                <li>• Prioritize recovery with 7-9 hours of sleep</li>
              </>
            )}
          </ul>
        </Card>
          </>
        )}
      </div>
    </div>
  );
};

interface CustomWorkoutBuilderProps {
  customExercises: Exercise[];
  setCustomExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  completed: number[];
  toggleComplete: (id: number) => void;
  calculateProgress: () => number;
  getMuscleGroupColor: (muscleGroup: string) => string;
  saveCustomWorkout: () => Promise<void>;
  loadCustomWorkout: (workout: { id: string; name: string; exercises: Exercise[] }) => void;
  deleteCustomWorkout: (id: string, name: string) => Promise<void>;
  startNewCustomWorkout: () => void;
  savedWorkouts: Array<{ id: string; name: string; exercises: Exercise[] }>;
  currentWorkoutName: string;
  setCurrentWorkoutName: (name: string) => void;
  currentWorkoutId: string | null;
}

const CustomWorkoutBuilder = ({ 
  customExercises, 
  setCustomExercises, 
  completed, 
  toggleComplete, 
  calculateProgress,
  getMuscleGroupColor,
  saveCustomWorkout,
  loadCustomWorkout,
  deleteCustomWorkout,
  startNewCustomWorkout,
  savedWorkouts,
  currentWorkoutName,
  setCurrentWorkoutName,
  currentWorkoutId
}: CustomWorkoutBuilderProps) => {
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("12");
  const [muscleGroup, setMuscleGroup] = useState("Chest");
  const [rest, setRest] = useState("60s");
  const { toast } = useToast();

  const addExercise = () => {
    if (!exerciseName.trim()) {
      toast({
        title: "Exercise name required",
        description: "Please enter an exercise name",
        variant: "destructive",
      });
      return;
    }

    const newExercise = {
      id: Date.now(),
      name: exerciseName,
      sets: `${sets} sets`,
      reps: `${reps} reps`,
      muscleGroup,
      rest,
    };

    setCustomExercises([...customExercises, newExercise]);
    setExerciseName("");
    setSets("3");
    setReps("12");
    setRest("60s");
    
    toast({
      title: "Exercise Added!",
      description: `${exerciseName} added to your workout`,
    });
  };

  const removeExercise = (id: number) => {
    setCustomExercises(customExercises.filter(ex => ex.id !== id));
  };

  const clearWorkout = () => {
    setCustomExercises([]);
    toast({
      title: "Workout Cleared",
      description: "All exercises removed",
    });
  };

  return (
    <>
      {/* Saved Workouts Section */}
      {savedWorkouts.length > 0 && (
        <Card className="p-6 mb-6 bg-gradient-to-br from-success/10 to-card/50 backdrop-blur-sm border-2 border-success/30 shadow-xl">
          <h3 className="text-xl font-bold text-success mb-4">Your Saved Workouts</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedWorkouts.map((workout) => (
              <Card 
                key={workout.id}
                className="p-4 bg-card hover:bg-card/80 border-border hover:border-success transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1" onClick={() => loadCustomWorkout(workout)}>
                    <h4 className="font-bold text-foreground group-hover:text-success transition-colors">
                      {workout.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {workout.exercises.length} exercises
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCustomWorkout(workout.id, workout.name);
                    }}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          {customExercises.length > 0 && (
            <Button
              onClick={startNewCustomWorkout}
              variant="outline"
              className="w-full mt-4"
            >
              Start New Workout
            </Button>
          )}
        </Card>
      )}

      {/* Workout Name & Save Section */}
      {customExercises.length > 0 && (
        <Card className="p-6 mb-6 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm border-2 border-border/50">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Workout Name {currentWorkoutId && <Badge variant="outline" className="ml-2">Editing</Badge>}
              </label>
              <input
                type="text"
                value={currentWorkoutName}
                onChange={(e) => setCurrentWorkoutName(e.target.value)}
                placeholder="e.g., Monday Upper Body"
                className="w-full px-4 py-3 rounded-lg bg-background border-2 border-border focus:border-primary focus:outline-none transition-colors text-base"
              />
            </div>
            <Button
              onClick={saveCustomWorkout}
              size="lg"
              className="hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <Trophy className="w-5 h-5 mr-2" />
              {currentWorkoutId ? "Update Workout" : "Save Workout"}
            </Button>
          </div>
        </Card>
      )}

      {/* Add Exercise Form */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm border-2 border-primary/20 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-primary">Build Your Workout</h2>
            <p className="text-sm text-muted-foreground mt-1">Add exercises to create your personalized training session</p>
          </div>
          {customExercises.length > 0 && (
            <Badge variant="outline" className="text-lg px-4 py-2">
              {customExercises.length} {customExercises.length === 1 ? 'Exercise' : 'Exercises'}
            </Badge>
          )}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-1">
            <label className="text-sm font-semibold text-foreground mb-2 block">Exercise Name *</label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="e.g., Bench Press, Squats"
              className="w-full px-4 py-3 rounded-lg bg-background border-2 border-border focus:border-primary focus:outline-none transition-colors text-base"
              onKeyPress={(e) => e.key === 'Enter' && addExercise()}
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Muscle Group</label>
            <select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background border-2 border-border focus:border-primary focus:outline-none transition-colors text-base"
            >
              <option value="Chest">Chest</option>
              <option value="Back">Back</option>
              <option value="Shoulders">Shoulders</option>
              <option value="Legs">Legs</option>
              <option value="Arms">Arms</option>
              <option value="Core">Core</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Sets</label>
            <input
              type="number"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              min="1"
              max="10"
              className="w-full px-4 py-3 rounded-lg bg-background border-2 border-border focus:border-primary focus:outline-none transition-colors text-base"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Reps</label>
            <input
              type="text"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="e.g., 12 or 8-12"
              className="w-full px-4 py-3 rounded-lg bg-background border-2 border-border focus:border-primary focus:outline-none transition-colors text-base"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Rest Period</label>
            <select
              value={rest}
              onChange={(e) => setRest(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background border-2 border-border focus:border-primary focus:outline-none transition-colors text-base"
            >
              <option value="30s">30 seconds</option>
              <option value="45s">45 seconds</option>
              <option value="60s">60 seconds</option>
              <option value="75s">75 seconds</option>
              <option value="90s">90 seconds</option>
              <option value="120s">2 minutes</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={addExercise}
            size="lg"
            className="flex-1 hover:scale-105 transition-all duration-300 shadow-lg text-base font-semibold"
          >
            <Zap className="w-5 h-5 mr-2" />
            Add Exercise
          </Button>
          {customExercises.length > 0 && (
            <Button
              onClick={clearWorkout}
              size="lg"
              variant="destructive"
              className="hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Clear All
            </Button>
          )}
        </div>
      </Card>

      {/* Progress Card */}
      {customExercises.length > 0 && (
        <Card className="p-6 mb-6 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm border-2 border-border/50 glow-effect-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Your Custom Workout</div>
              <div className="text-3xl font-bold text-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                {completed.length}/{customExercises.length}
              </div>
              <div className="text-muted-foreground">Exercises Completed</div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-success drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                {calculateProgress()}%
              </div>
              <div className="text-muted-foreground">Progress</div>
            </div>
          </div>
        </Card>
      )}

      {/* Exercise List */}
      {customExercises.length > 0 ? (
        <div className="space-y-4 mb-6">
          {customExercises.map((exercise) => {
            const isCompleted = completed.includes(exercise.id);
            return (
              <Card 
                key={exercise.id}
                className={`p-6 transition-all duration-500 border-2 card-lift ${
                  isCompleted 
                    ? 'bg-primary/5 border-primary/50 glow-effect-sm' 
                    : 'bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                      isCompleted ? 'bg-primary scale-110 rotate-12' : 'bg-muted hover:scale-105'
                    }`}
                    onClick={() => toggleComplete(exercise.id)}
                  >
                    <CheckCircle2 className={`w-6 h-6 transition-all duration-300 ${
                      isCompleted ? 'text-white animate-[fade-in_0.3s_ease-out]' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold">{exercise.name}</h3>
                      <Badge className={`text-xs px-3 py-1 ${getMuscleGroupColor(exercise.muscleGroup)}`}>
                        {exercise.muscleGroup}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {exercise.sets}
                      </span>
                      <span>•</span>
                      <span>{exercise.reps}</span>
                      <span>•</span>
                      <span>Rest: {exercise.rest}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(exercise.id)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-2 border-dashed border-border/50">
          <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-bold mb-2 text-muted-foreground">No Exercises Yet</h3>
          <p className="text-muted-foreground/70">Add exercises above to build your custom workout</p>
        </Card>
      )}
    </>
  );
};

export default Gym;