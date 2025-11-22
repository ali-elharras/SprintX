const ImageKit = require("imagekit");

let imagekit = null;
const hasImageKitConfig =
  process.env.IMAGEKIT_PUBLIC_KEY &&
  process.env.IMAGEKIT_PRIVATE_KEY &&
  process.env.IMAGEKIT_URL_ENDPOINT;

if (hasImageKitConfig) {
  try {
    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  } catch (err) {
    console.error("Failed to initialize ImageKit:", err.message || err);
    imagekit = null;
  }
} else {
  console.warn(
    "ImageKit credentials not found. Image uploads will be disabled in this environment."
  );
}

const uploadImage = async (fileBase64, fileName, folderName) => {
  if (!imagekit) {
    console.warn(
      `uploadImage skipped: ImageKit not configured. fileName=${fileName} folder=${folderName}`
    );
    // Returning null so callers can handle absence of uploaded URL.
    return null;
  }

  try {
    const response = await imagekit.upload({
      file: fileBase64, // base64 string
      fileName: fileName,
      folder: folderName,
      useUniqueFileName: true,
    });
    return response.url;
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw new Error("Failed to upload image to ImageKit.");
  }
};

module.exports = { uploadImage };
