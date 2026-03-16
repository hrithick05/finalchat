// XP Constants
const XP_CONSTANTS = {
  MESSAGE: 10,
  MEDIA: 5,
  REACTION: 2,
};

// Level thresholds
const LEVEL_THRESHOLDS = {
  1: 0,
  2: 500,
  3: 1500,
  4: 2000,
  5: 3000,
};

const LEVEL_NAMES = {
  1: "Acquaintance",
  2: "Friend",
  3: "Good Friend",
  4: "Close Friend",
  5: "Best Friend",
};

export function calculateXPReward(hasMedia) {
  let xp = XP_CONSTANTS.MESSAGE;
  if (hasMedia) {
    xp += XP_CONSTANTS.MEDIA;
  }
  return xp;
}

export function calculateLevel(totalXP) {
  if (totalXP >= LEVEL_THRESHOLDS[5]) return 5;
  if (totalXP >= LEVEL_THRESHOLDS[4]) return 4;
  if (totalXP >= LEVEL_THRESHOLDS[3]) return 3;
  if (totalXP >= LEVEL_THRESHOLDS[2]) return 2;
  return 1;
}

export function getLevelName(level) {
  return LEVEL_NAMES[level] || "Acquaintance";
}

export function updateStreak(lastMessageDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!lastMessageDate) {
    return 1;
  }

  const lastDate = new Date(lastMessageDate);
  lastDate.setHours(0, 0, 0, 0);

  const diffTime = today - lastDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return null; // Signal to increment streak
  } else if (diffDays === 0) {
    return null; // Signal to keep streak same
  } else {
    return 1; // Reset streak
  }
}

export function addReactionXP(user) {
  user.xp += XP_CONSTANTS.REACTION;
  user.level = calculateLevel(user.xp);
  return user;
}

export const LEVEL_COLOR = {
  1: "#6B7280",    // Gray
  2: "#3B82F6",    // Blue
  3: "#10B981",    // Green
  4: "#F59E0B",    // Amber
  5: "#EF4444",    // Red
};
