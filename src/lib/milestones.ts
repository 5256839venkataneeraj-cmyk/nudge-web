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
  reflectionNote?: string;
  moodTags?: string[];
  stats?: {
    stat1Label?: string;
    stat1Value?: string;
    stat2Label?: string;
    stat2Value?: string;
    stat3Label?: string;
    stat3Value?: string;
  };
  displayOnHome?: boolean;
}

export const INITIAL_MILESTONES: MilestoneBadge[] = [
  {
    id: "campus_commute",
    title: "7-Day Campus Commute",
    category: "habits",
    tier: "sprout",
    icon: "🚴",
    description: "5 miles pedaled, morning brain fog cleared gently before class.",
    progressText: "7 of 7 days completed",
    isUnlocked: true,
    unlockedAt: "This morning at 8:45 AM • Week 8",
    level: 1,
    celebrationNote: "5 miles pedaled, morning brain fog cleared gently before 9 AM Bioethics lecture. You showed up for yourself 7 mornings in a row.",
    reflectionNote: "Felt so much more clear-headed for Chem Lab after pedaling past the duck pond.",
    moodTags: ["🍃 Clear-headed", "🦆 Duck pond"],
    stats: {
      stat1Label: "Miles Pedaled",
      stat1Value: "35.2",
      stat2Label: "Fresh Air Reset",
      stat2Value: "175m",
      stat3Label: "Gentle Rhythm",
      stat3Value: "7 / 7",
    },
    displayOnHome: true,
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
    stats: {
      stat1Label: "Liters Logged",
      stat1Value: "20.4L",
      stat2Label: "Energy Boost",
      stat2Value: "+35%",
      stat3Label: "Rhythm",
      stat3Value: "10 / 10",
    },
    displayOnHome: true,
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

export function updateMilestoneReflection(
  badgeId: string,
  reflectionNote: string,
  moodTags?: string[],
  displayOnHome?: boolean
): MilestoneBadge | null {
  const current = getLocalMilestones();
  const index = current.findIndex((b) => b.id === badgeId);
  if (index === -1) return null;

  current[index] = {
    ...current[index],
    reflectionNote,
    ...(moodTags !== undefined ? { moodTags } : {}),
    ...(displayOnHome !== undefined ? { displayOnHome } : {}),
  };
  saveLocalMilestones(current);
  return current[index];
}
