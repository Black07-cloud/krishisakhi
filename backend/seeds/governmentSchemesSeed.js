import mongoose from "mongoose";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

// Import the GovernmentScheme model
import GovernmentScheme from "../src/models/GovernmentScheme.js";


async function seedGovernmentSchemes() {
  let connection;

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("❌ MONGO_URI not found in environment variables.");
      console.error(
        "   Make sure .env file exists in the backend directory with MONGO_URI defined.",
      );
      process.exit(1);
    }

    console.log("🔄 Connecting to MongoDB...");
    connection = await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Connected Successfully");

    // Read the schemes data
    const dataPath = join(__dirname, "..", "src", "data", "governmentSchemes.json");
    const rawData = await readFile(dataPath, "utf-8");
    const schemes = JSON.parse(rawData);

    console.log(`\n📋 Found ${schemes.length} schemes to seed.\n`);

    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Upsert each scheme (insert if not exists, update if exists)
    for (const scheme of schemes) {
      try {
        const result = await GovernmentScheme.findOneAndUpdate(
          { name: scheme.name }, // Match by exact scheme name
          {
            $set: {
              shortName: scheme.shortName,
              description: scheme.description,
              state: scheme.state,
              level: scheme.level,
              category: scheme.category,
              benefits: scheme.benefits,
              eligibility: scheme.eligibility,
              requiredDocuments: scheme.requiredDocuments,
              applicationProcess: scheme.applicationProcess,
              officialUrl: scheme.officialUrl,
              informationUrl: scheme.informationUrl,
              helpline: scheme.helpline,
              lastUpdated: scheme.lastUpdated,
              isActive: scheme.isActive,
              source: scheme.source,
            },
          },
          {
            upsert: true, // Create if doesn't exist
            new: true, // Return the modified document
            runValidators: true, // Run schema validators on update
          },
        );

        // Check if it was an insert (no _id before) or update
        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          insertedCount++;
          console.log(`  ✅ Inserted: ${scheme.name}`);
        } else {
          updatedCount++;
          console.log(`  🔄 Updated: ${scheme.name}`);
        }
      } catch (err) {
        errorCount++;
        errors.push({ name: scheme.name, error: err.message });
        console.error(`  ❌ Error with "${scheme.name}": ${err.message}`);
      }
    }

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SEED SUMMARY");
    console.log("=".repeat(60));
    console.log(`  Total schemes processed: ${schemes.length}`);
    console.log(`  ✅ Inserted (new):       ${insertedCount}`);
    console.log(`  🔄 Updated (existing):   ${updatedCount}`);
    console.log(`  ❌ Errors:               ${errorCount}`);
    console.log("=".repeat(60));

    if (errors.length > 0) {
      console.log("\n⚠️  Errors encountered:");
      errors.forEach((e) => {
        console.log(`  - ${e.name}: ${e.error}`);
      });
    }

    // Verify total count in database
    const totalInDB = await GovernmentScheme.countDocuments();
    console.log(`\n📈 Total schemes in database: ${totalInDB}`);

    // Print category breakdown
    const categoryBreakdown = await GovernmentScheme.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log("\n📂 Category Breakdown:");
    categoryBreakdown.forEach((cat) => {
      console.log(`  ${cat._id}: ${cat.count}`);
    });

    // Print level breakdown
    const levelBreakdown = await GovernmentScheme.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$level", count: { $sum: 1 } } },
    ]);

    console.log("\n🏛️  Level Breakdown:");
    levelBreakdown.forEach((lvl) => {
      console.log(`  ${lvl._id}: ${lvl.count}`);
    });

    console.log("\n✅ Seeding completed successfully!");
  } catch (error) {
    console.error("\n❌ Fatal error during seeding:", error.message);
    process.exit(1);
  } finally {
    // Close the database connection
    if (connection) {
      await mongoose.connection.close();
      console.log("🔌 Database connection closed.");
    }
  }
}

// Run the seed script
seedGovernmentSchemes();
