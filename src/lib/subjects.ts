import { SubjectModule } from "../types";

const STORAGE_KEY_SUBJECTS = "nudge_student_subjects";

export const DEFAULT_SUBJECTS: SubjectModule[] = [
  {
    id: "subj_calculus",
    name: "Calculus",
    code: "MATH 201",
    icon: "📐",
    color: "#5B8A82",
    streakDays: 14,
    studyMinutesToday: 45,
    openTasksCount: 2,
    description: "Multivariable differential & integral calculus, optimization problems, and gradient fields.",
    nextTopic: "Double integrals & Green's theorem",
    targetWeeklyHours: 6,
  },
  {
    id: "subj_engineering",
    name: "Basic Engineering",
    code: "ENGG 101",
    icon: "⚙️",
    color: "#3A6351",
    streakDays: 8,
    studyMinutesToday: 30,
    openTasksCount: 1,
    description: "Engineering mechanics, circuit analysis fundamentals, and material stress tensors.",
    nextTopic: "Truss equilibrium & shear force diagrams",
    targetWeeklyHours: 5,
  },
  {
    id: "subj_chemistry",
    name: "Applied Chemistry",
    code: "CHEM 102",
    icon: "🧪",
    color: "#6F9E8B",
    streakDays: 11,
    studyMinutesToday: 40,
    openTasksCount: 3,
    description: "Reaction kinetics, chemical thermodynamics, electrochemistry, and aqueous solutions.",
    nextTopic: "Gibbs free energy & Nernst equation",
    targetWeeklyHours: 5,
  },
  {
    id: "subj_python",
    name: "Python",
    code: "CS 105",
    icon: "🐍",
    color: "#4A7C59",
    streakDays: 19,
    studyMinutesToday: 60,
    openTasksCount: 1,
    description: "Algorithmic thinking, data structures, Pandas data processing, and automation scripts.",
    nextTopic: "Pandas groupby & vectorized matrix operations",
    targetWeeklyHours: 7,
  },
  {
    id: "subj_english",
    name: "English",
    code: "ENG 101",
    icon: "📖",
    color: "#7EA89B",
    streakDays: 6,
    studyMinutesToday: 25,
    openTasksCount: 2,
    description: "Academic discourse, rhetoric, peer-reviewed synthesis, and technical communication.",
    nextTopic: "Annotated bibliography & counter-argument drafting",
    targetWeeklyHours: 4,
  },
  {
    id: "subj_enviro",
    name: "Environmental Science",
    code: "ENV 101",
    icon: "🌿",
    color: "#5B8A82",
    streakDays: 9,
    studyMinutesToday: 35,
    openTasksCount: 1,
    description: "Biogeochemical cycles, renewable energy transitions, and ecological conservation policy.",
    nextTopic: "Watershed restoration & wetland hydrology",
    targetWeeklyHours: 4,
  },
];

/**
 * Loads stored subjects from localStorage or initializes with default student subjects.
 */
export function getStoredSubjects(): SubjectModule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to load stored subjects:", err);
  }
  return DEFAULT_SUBJECTS;
}

/**
 * Saves subjects to localStorage and dispatches change event for cross-component sync.
 */
export function saveStoredSubjects(subjects: SubjectModule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjects));
    window.dispatchEvent(new CustomEvent("nudge_subjects_updated", { detail: subjects }));
  } catch (err) {
    console.warn("Failed to save subjects:", err);
  }
}

/**
 * Adds a new subject to the curriculum.
 */
export function addSubject(subjectData: Omit<SubjectModule, "id">): SubjectModule[] {
  const current = getStoredSubjects();
  const newSubject: SubjectModule = {
    ...subjectData,
    id: "subj_" + Math.random().toString(36).substring(2, 9),
    streakDays: subjectData.streakDays ?? 1,
    studyMinutesToday: subjectData.studyMinutesToday ?? 0,
    openTasksCount: subjectData.openTasksCount ?? 0,
  };
  const updated = [...current, newSubject];
  saveStoredSubjects(updated);
  return updated;
}

/**
 * Updates an existing subject by ID.
 */
export function updateSubject(id: string, updates: Partial<SubjectModule>): SubjectModule[] {
  const current = getStoredSubjects();
  const updated = current.map((subj) => (subj.id === id ? { ...subj, ...updates } : subj));
  saveStoredSubjects(updated);
  return updated;
}

/**
 * Deletes a subject by ID.
 */
export function deleteSubject(id: string): SubjectModule[] {
  const current = getStoredSubjects();
  const updated = current.filter((subj) => subj.id !== id);
  saveStoredSubjects(updated);
  return updated;
}

/**
 * Interactively increments the study streak and logs session minutes.
 */
export function incrementSubjectStreak(id: string, additionalMinutes = 15): SubjectModule[] {
  const current = getStoredSubjects();
  const updated = current.map((subj) => {
    if (subj.id === id) {
      return {
        ...subj,
        streakDays: subj.streakDays + 1,
        studyMinutesToday: subj.studyMinutesToday + additionalMinutes,
      };
    }
    return subj;
  });
  saveStoredSubjects(updated);
  return updated;
}

/**
 * Resets subjects back to default 6 modules.
 */
export function resetToDefaultSubjects(): SubjectModule[] {
  saveStoredSubjects(DEFAULT_SUBJECTS);
  return DEFAULT_SUBJECTS;
}
