const { MongoClient, Binary } = require("mongodb");
const fs = require("fs");
const path = require("path");

const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://hok_admin:rXB28z2mfFma7IGB@hok.iy4ehsq.mongodb.net/?retryWrites=true&w=1";
const DB_NAME = process.env.DB_NAME || "house_of_the_knight";

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function run() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    console.log("Connected to Atlas successfully!");
    const db = client.db(DB_NAME);

    // Create index on media
    await db.collection("media").createIndex({ path: 1 }, { unique: true });
    await db.collection("deleted_slugs").createIndex({ slug: 1 }, { unique: true });

    const staticDir = path.join(__dirname, "static_images");
    if (!fs.existsSync(staticDir)) {
      console.error("static_images directory not found at", staticDir);
      return;
    }

    const files = getAllFiles(staticDir);
    console.log(`Found ${files.length} static images to seed into MongoDB Atlas...`);

    let count = 0;
    for (const filePath of files) {
      const ext = path.extname(filePath).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;

      const relPath = path.relative(staticDir, filePath).replace(/\\/g, "/");
      const buffer = fs.readFileSync(filePath);
      const contentType = getContentType(filePath);
      const binaryData = new Binary(buffer);

      const paths = [
        `images/${relPath}`,
        relPath,
        `/${relPath}`,
        `/images/${relPath}`,
      ];

      for (const p of paths) {
        await db.collection("media").updateOne(
          { path: p },
          {
            $set: {
              path: p,
              data: binaryData,
              content_type: contentType,
              size: buffer.length,
              updated_at: new Date(),
            },
            $setOnInsert: {
              created_at: new Date(),
            },
          },
          { upsert: true }
        );
      }
      count++;
    }

    console.log(`Successfully uploaded & indexed ${count} image files into MongoDB Atlas collection 'media'!`);

    // Verify media count in database
    const totalMedia = await db.collection("media").countDocuments();
    console.log(`Total documents in db.media: ${totalMedia}`);

    // Verify products collection
    const productsCount = await db.collection("products").countDocuments();
    console.log(`Total products currently in db.products: ${productsCount}`);

    const sampleMedia = await db.collection("media").findOne({ path: "images/blonde-amber.jpg" }, { projection: { path: 1, content_type: 1, size: 1 } });
    console.log("Sample media doc verification:", sampleMedia);

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await client.close();
    console.log("Atlas client closed.");
  }
}

run();
