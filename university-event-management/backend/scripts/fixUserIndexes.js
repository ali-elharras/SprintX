const mongoose = require("mongoose");
require("dotenv").config();

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not set in environment");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    const User = mongoose.connection.collection("users");

    const indexes = await User.indexes();
    console.log("ℹ️ Current indexes:", indexes.map(i => i.name));

    // Drop old unique index on universityId if present
    const uniIdx = indexes.find(i => i.name === "universityId_1");
    if (uniIdx && uniIdx.unique && !uniIdx.partialFilterExpression) {
      console.log("🗑️ Dropping legacy unique index: universityId_1");
      await User.dropIndex("universityId_1");
    }

    // Ensure partial unique index exists
    const partialName = "universityId_1_partial_non_admin";
    const hasPartial = indexes.some(
      i => i.name === partialName || (i.key && i.key.universityId === 1 && i.partialFilterExpression)
    );

    if (!hasPartial) {
      console.log("🛠️ Creating partial unique index on universityId for non-admin users");
      await User.createIndex(
        { universityId: 1 },
        {
          name: partialName,
          unique: true,
          partialFilterExpression: {
            universityId: { $exists: true, $type: "string" },
            role: { $nin: ["admin", "events_office"] },
          },
        }
      );
    } else {
      console.log("✅ Partial unique index already exists");
    }

    console.log("✅ Index update complete");
  } catch (err) {
    console.error("❌ Error updating indexes:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
