import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios.js";
import { Trophy, Loader2 } from "lucide-react";
import LevelBadge from "./LevelBadge";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/messages/leaderboard");
        setLeaderboard(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getMedalEmoji = (rank) => {
    if (rank === 0) return "🥇";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return `#${rank + 1}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="text-yellow-500 size-6" />
        <h2 className="text-2xl font-bold text-gray-800">Global Leaderboard</h2>
      </div>

      <div className="space-y-3">
        {leaderboard.map((user, index) => (
          <div
            key={user._id}
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all"
          >
            <div className="text-3xl font-bold text-blue-600 w-10 text-center">
              {getMedalEmoji(index)}
            </div>

            <div className="flex-1">
              <p className="font-semibold text-gray-800">{user.fullName}</p>
              <p className="text-sm text-gray-600">{user.xp ?? 0} XP</p>
            </div>

            <div className="flex items-center gap-3">
              {(user.streakDays ?? 0) > 0 && (
                <div className="text-sm font-bold text-orange-600">
                  🔥 {user.streakDays}
                </div>
              )}
              {user.level !== undefined && <LevelBadge level={user.level ?? 1} xp={user.xp ?? 0} streakDays={user.streakDays ?? 0} showTooltip={false} />}
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users yet. Start sending messages to join the leaderboard! 🚀</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
