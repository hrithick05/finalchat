import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Zap, Flame, Trophy } from "lucide-react";
import LevelBadge from "../components/LevelBadge";
import Leaderboard from "../components/Leaderboard";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="h-full pt-20">
      <div className="max-w-4xl mx-auto p-4 py-8 space-y-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gamification Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-200">Level</span>
              <Trophy className="size-5" />
            </div>
            <div className="text-4xl font-bold">{authUser?.level ?? 1}</div>
            <div className="text-blue-200 text-sm mt-2">
              {(authUser?.level ?? 1) === 5 ? "Best Friend! 🎉" : "Keep messaging to level up!"}
            </div>
          </div>

          <div className="bg-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-200">Total XP</span>
              <Zap className="size-5" />
            </div>
            <div className="text-4xl font-bold">{authUser?.xp ?? 0}</div>
            <div className="text-purple-200 text-sm mt-2">Experience points</div>
          </div>

          <div className="bg-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-200">Streak</span>
              <Flame className="size-5" />
            </div>
            <div className="text-4xl font-bold">{authUser?.streakDays ?? 0}</div>
            <div className="text-orange-200 text-sm mt-2">consecutive days</div>
          </div>
        </div>

        {/* Level Badge Display */}
        <div className="bg-base-300 rounded-xl p-6">
          <h2 className="text-lg font-medium mb-4">Your Rank</h2>
          <div className="flex items-center gap-4">
            <LevelBadge level={authUser?.level ?? 1} xp={authUser?.xp ?? 0} streakDays={authUser?.streakDays ?? 0} showTooltip={true} />
            <div className="text-sm text-zinc-400">
              <p>Level {authUser?.level ?? 1} - {["Acquaintance", "Friend", "Good Friend", "Close Friend", "Best Friend"][Math.min((authUser?.level ?? 1) - 1, 4)]}</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <Leaderboard />
      </div>
    </div>
  );
};
export default ProfilePage;
