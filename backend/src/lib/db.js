import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("⚠️ Make sure your IP is whitelisted in MongoDB Atlas:");
    console.error("   1. Go to https://cloud.mongodb.com");
    console.error("   2. Click 'Network Access' in the sidebar");
    console.error("   3. Click 'Add IP Address' and add your current IP or 0.0.0.0/0");
    console.error("   4. Restart the server after whitelisting");
    
    // Try to reconnect after 5 seconds
    setTimeout(connectDB, 5000);
  }
};
