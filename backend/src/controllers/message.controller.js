import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { calculateXPReward, calculateLevel, updateStreak } from "../lib/gamification.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
      .select("-password")
      .lean();

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const { page = 1 } = req.query;
    const myId = req.user._id;
    const limit = 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .populate("senderId", "fullName profilePic level")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json(messages.reverse());
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

    // Create message without waiting for image upload (if image exists, upload in background)
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: null,
      reactions: [],
      xpAwarded: false,
    });

    await newMessage.save();

    // Update user stats with batch operation (no need to fetch user first)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hasMedia = !!image;
    const xpReward = calculateXPReward(hasMedia);

    await User.findByIdAndUpdate(
      senderId,
      {
        $inc: { xp: xpReward },
        $set: {
          level: calculateLevel(xpReward),
          lastMessageDate: new Date(),
        },
      }
    );

    // Send message immediately to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);

    // Upload image in background if present (non-blocking)
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          resource_type: "auto",
          quality: "auto",
          fetch_format: "auto",
        });
        
        // Update message with image URL
        const updatedMessage = await Message.findByIdAndUpdate(newMessage._id, {
          image: uploadResponse.secure_url,
        }, { new: true });

        // Emit updated message to both sender and receiver
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messageImageUpdated", {
            messageId: newMessage._id,
            imageUrl: uploadResponse.secure_url,
          });
        }
        
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageImageUpdated", {
            messageId: newMessage._id,
            imageUrl: uploadResponse.secure_url,
          });
        }
      } catch (uploadError) {
        console.log("Background image upload failed:", uploadError.message);
        // Message still sent, just without image
      }
    }
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
      .limit(10)
      .lean();

    res.status(200).json(leaderboard);
  } catch (error) {
    console.log("Error in getLeaderboard controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .select("fullName level xp streakDays profilePic email")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserStats controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
