import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { calculateXPReward, calculateLevel, updateStreak } from "../lib/gamification.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).populate("senderId", "fullName profilePic level");

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
        reactions: [],
      xpAwarded: false,
    });

    await newMessage.save();

    // Award XP and update streak for sender
    const sender = await User.findById(senderId);
    const hasMedia = !!imageUrl;
    const xpReward = calculateXPReward(hasMedia);
    
    sender.xp += xpReward;
    sender.level = calculateLevel(sender.xp);

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (sender.lastMessageDate) {
      const lastDate = new Date(sender.lastMessageDate);
      lastDate.setHours(0, 0, 0, 0);
      
      const diffTime = today - lastDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        sender.streakDays += 1;
      } else if (diffDays > 1) {
        sender.streakDays = 1; // Reset streak
      }
    } else {
      sender.streakDays = 1;
    }
    
    sender.lastMessageDate = new Date();
    await sender.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find()
      .select("fullName level xp streakDays profilePic")
      .sort({ xp: -1 })
      .limit(10);

    res.status(200).json(leaderboard);
  } catch (error) {
    console.log("Error in getLeaderboard controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("fullName level xp streakDays profilePic email");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserStats controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
