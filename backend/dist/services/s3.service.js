import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";
import { getS3Client } from "../config/s3.js";
export const uploadFileToS3 = async (file, folder = "products") => {
    const BUCKET_NAME = process.env.AWS_S3_BUCKET;
    const s3Client = getS3Client();
    const fileExtension = path.extname(file.originalname);
    const uniqueIdentifier = crypto.randomUUID();
    const fileName = `${folder}/${uniqueIdentifier}.${fileExtension}`;
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    });
    await s3Client.send(command);
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};
/**
 * Parses out the S3 object key and permanently purges the file from the bucket.
 */
export const deleteFileFromS3 = async (fileUrl) => {
    const s3Client = getS3Client();
    const BUCKET_NAME = process.env.AWS_S3_BUCKET;
    const key = new URL(fileUrl).pathname.slice(1);
    ;
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });
    await s3Client.send(command);
};
//# sourceMappingURL=s3.service.js.map