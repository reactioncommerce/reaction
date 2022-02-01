import MediaData from "../../json-data/cfs.Media.filerecord.json";

const imageTypes = ["image", "large", "medium", "small", "thumbnail"];

const now = new Date();

/**
 * @summary load a single Shop
 * @param {object} context - The application context
 * @returns {Promise<Boolean>} true if success
 */
export default async function loadMediaFileRecord(context) {
  const { collections: { MediaRecords } } = context;
  MediaData.forEach((mediaRecord) => {
    mediaRecord.original.createdAt = now;
    mediaRecord.original.updatedAt = now;
    mediaRecord.original.uploadedAt = now;
    imageTypes.forEach((imageType) => {
      mediaRecord.copies[imageType].createdAt = now;
      mediaRecord.copies[imageType].updatedAt = now;
    });
  });
  await MediaRecords.insertMany(MediaData);
}
