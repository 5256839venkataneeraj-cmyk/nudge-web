export interface MilestoneBadge {
  id: string;
  title: string;
  category: "habits" | "study" | "mindset" | "wellness";
  tier: "sprout" | "seedling" | "taproot" | "canopy";
  icon: string; // Emoji or Lucide icon name
  description: string;
  progressText: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  level: number;
  celebrationNote: string;
}

export const INITIAL_MILESTONES: MilestoneBadge[] = [
  {
    id: "campus_commute",
    title: "Campus Commute",
    category: "habits",
    tier: "sprout",
    icon: "🚴",
    description: "Pedaled to lectures 5 days in a row, clearing morning brain fog.",
    progressText: "5 of 5 days completed",
    isUnlocked: true,
    unlockedAt: "Yesterday at 9:15 AM",
    level: 1,
    celebrationNote: "Consistent physical motion grounds mental focus before lectures.",
  },
  {
    id: "hydrated_rhythm",
    title: "10 Days Hydrated",
    category: "wellness",
    tier: "sprout",
    icon: "💧",
    description: "Hit daily water markers 10 days straight without tracking fatigue.",
    progressText: "10 of 10 days rooted",
    isUnlocked: true,
    unlockedAt: "Today at 8:30 AM",
    level: 1,
    celebrationNote: "Nourished body, calm mind. Small sips prevent mid-afternoon slumps.",
  },
  {
    id: "mindful_breath",
    title: "Mindful Breath",
    category: "wellness",
    tier: "sprout",
    icon: "🧘",
    description: "Took 3 intentional breathers during study sprints instead of doomscrolling.",
    progressText: "3 of 3 breathers taken",
    isUnlocked: true,
    unlockedAt: "3 days ago",
    level: 1,
    celebrationNote: "Pausing when overwhelmed builds enduring academic stamina.",
  },
  {
    id: "gentle_return",
    title: "Gentle Return",
    category: "mindset",
    tier: "seedling",
    icon: "🌱",
    description: "Returned to study routine after a missed day with self-compassion, not guilt.",
    progressText: "Rooted after reset",
    isUnlocked: true,
    unlockedAt: "4 days ago",
    level: 2,
    celebrationNote: "Real consistency is coming back kindly, again and again.",
  },
  {
    id: "focus_cadence",
    title: "Focus Cadence",
    category: "study",
    tier: "seedling",
    icon: "🎯",
    description: "Completed three 25-minute PubMed research sprints with protected breaks.",
    progressText: "3 of 3 sprints locked",
    isUnlocked: true,
    unlockedAt: "Oct 20",
    level: 2,
    celebrationNote: "Short bursts beat marathon cramming every single time.",
  },
  {
    id: "quiet_evening",
    title: "Quiet Wind-Down",
    category: "wellness",
    tier: "seedling",
    icon: "🌙",
    description: "Set laptop aside 30 minutes before bed to allow your nervous system to settle.",
    progressText: "3 evenings honored",
    isUnlocked: true,
    unlockedAt: "Oct 19",
    level: 2,
    celebrationNote: "Protecting your sleep is the highest-leverage study strategy.",
  },
  {
    id: "taproot_patience",
    title: "Deep Taproot",
    category: "study",
    tier: "taproot",
    icon: "🪴",
    description: "Maintain a steady 14-day study rhythm without burning midnight oil.",
    progressText: "12 of 14 days completed (85%)",
    isUnlocked: false,
    level: 3,
    celebrationNote: "A deep root system weathers any exam storm.",
  },
  {
    id: "sunday_blueprint",
    title: "Sunday Blueprint",
    category: "mindset",
    tier: "taproot",
    icon: "🗺️",
    description: "Mapped out weekly deadlines on Sunday to remove Monday morning anxiety.",
    progressText: "Next Sunday prompt scheduled",
    isUnlocked: false,
    level: 3,
    celebrationNote: "Calm foresight turns academic chaos into gentle step-by-step progress.",
  },
  {
    id: "semester_horizon",
    title: "Semester Horizon",
    category: "study",
    tier: "canopy",
    icon: "🌳",
    description: "Finished midterms with balanced energy, zero all-nighters, and grounded habits.",
    progressText: "Unlocks at Midterms completion",
    isUnlocked: false,
    level: 4,
    celebrationNote: "The ultimate harmony: High academic achievement with radiant personal wellness.",
  },
];

const STORAGE_KEY = "nudge_milestones_vault_v1";

export function getLocalMilestones(): MilestoneBadge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MILESTONES));
      return INITIAL_MILESTONES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MILESTONES;
  }
}

export function saveLocalMilestones(badges: MilestoneBadge[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
  } catch (e) {
    console.error("Failed to save milestones:", e);
  }
}

export function unlockMilestoneBadge(badgeId: string): MilestoneBadge | null {
  const current = getLocalMilestones();
  const index = current.findIndex((b) => b.id === badgeId);
  if (index === -1) return null;

  current[index] = {
    ...current[index],
    isUnlocked: true,
    unlockedAt: "Just now",
  };
  saveLocalMilestones(current);
  return current[index];
}
