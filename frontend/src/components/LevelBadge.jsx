import { useState } from "react";
import { Star, Flame } from "lucide-react";

const LEVEL_CONFIG = {
  1: { name: "Acquaintance", color: "bg-gray-500", icon: "🌟", bgColor: "bg-gray-100" },
  2: { name: "Friend", color: "bg-blue-500", icon: "💙", bgColor: "bg-blue-100" },
  3: { name: "Good Friend", color: "bg-green-500", icon: "💚", bgColor: "bg-green-100" },
  4: { name: "Close Friend", color: "bg-amber-500", icon: "🧡", bgColor: "bg-amber-100" },
  5: { name: "Best Friend", color: "bg-red-500", icon: "❤️", bgColor: "bg-red-100" },
};

export const LevelBadge = ({ level = 1, xp = 0, streakDays = 0, showTooltip = true }) => {
  const [showPopover, setShowPopover] = useState(false);
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];

  const levelThresholds = {
    1: 0,
    2: 500,
    3: 1500,
    4: 2000,
    5: 3000,
  };

  const currentThreshold = levelThresholds[level] || 0;
  const nextThreshold = levelThresholds[level + 1] || levelThresholds[5];
  const xpInLevel = xp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const progressPercent = level === 5 ? 100 : (xpInLevel / xpNeeded) * 100;

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor} cursor-pointer transition-all hover:shadow-md`}
        onMouseEnter={() => showTooltip && setShowPopover(true)}
        onMouseLeave={() => showTooltip && setShowPopover(false)}
      >
        <span className="text-xl">{config.icon}</span>
        <span className="text-sm font-semibold text-gray-800">
          Lvl {level}
        </span>
        {streakDays > 0 && (
          <div className="flex items-center gap-1 ml-2 text-orange-500">
            <Flame size={14} />
            <span className="text-xs font-bold">{streakDays}</span>
          </div>
        )}
      </div>

      {showPopover && (
        <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-xl p-4 w-48 z-50 border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-2">{config.name}</h3>
          <div className="space-y-2 text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Level Progress</span>
                <span className="text-gray-700 font-semibold">{xpInLevel}/{xpNeeded} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${config.color}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-gray-600">Total XP: <span className="font-bold text-gray-800">{xp}</span></p>
              {streakDays > 0 && (
                <p className="text-orange-600 mt-1">
                  🔥 {streakDays} day{streakDays > 1 ? "s" : ""} streak!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelBadge;
