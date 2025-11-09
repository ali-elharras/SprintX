const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const uploadImage = async (fileBase64, fileName, folderName) => {
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
