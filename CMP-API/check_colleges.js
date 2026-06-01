import mongoose from "mongoose";

const MONGO_URL = "mongodb+srv://palaksharma111103_db_user:5CPtfrFkbgC4X4LU@cluster0.wvp3tj7.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("Connected!");

    const db = mongoose.connection.db;

    // Get all colleges
    console.log("\n--- All Colleges ---");
    const colleges = await db.collection("colleges").find({}).toArray();
    console.log(`Found ${colleges.length} colleges:`);
    colleges.forEach(c => {
      console.log(`- ID: ${c._id}, Name: "${c.collegeName}", Address: "${c.address}", Admin: "${c.admin}"`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
