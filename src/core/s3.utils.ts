import {
  S3Client,
  RestoreObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import logger from "./logger";

export class S3Utils {
  private s3Client: any;
  private bucketName: string;
  private prefix: string;

  constructor(bucketName: string, prefix: string) {
    this.s3Client = new S3Client({
      region: "us-east-1",
      
    });
    this.bucketName = bucketName;
    this.prefix = prefix;
  }

  async getChildKeys(
    parent: string,
    accumulatedKeys: string[] = []
  ): Promise<string[]> {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: `${this.prefix}${parent}`,
        Delimiter: "/", // Helps identify "folders"
      });

      const response = await this.s3Client.send(listCommand);

      // Add file keys (excluding prefix)
      if (response.Contents) {
        accumulatedKeys.push(
          ...response.Contents.map((obj: any) =>
            obj.Key!.replace(this.prefix, "")
          )
        );
      }

      // Recursively get keys from subfolders
      if (response.CommonPrefixes) {
        for (const folder of response.CommonPrefixes) {
          if (folder.Prefix) {
            await this.getChildKeys(
              folder.Prefix.replace(this.prefix, ""),
              accumulatedKeys
            );
          }
        }
      }

      return accumulatedKeys;
    } catch (error: any) {
      logger.error("Error listing child keys");
      return [];
    }
  }

  async getS3KeyMetadata(
    objectKey: string,
    sendLogToRenderer: (messgae: string) => void
  ) {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: "qalbox-media-ibm-aspera",
        Key: this.prefix + objectKey,
      });

      const metadata = await this.s3Client.send(headCommand);
      const storageClass = metadata.StorageClass || "STANDARD";

      if (storageClass === "GLACIER" || storageClass === "DEEP_ARCHIVE") {
        const restoreStatus = metadata.Restore;

        if (!restoreStatus) {
          await this.restoreObject(objectKey, sendLogToRenderer);
          return {
            isDownloadable: false,
            reason: "Object is archived and not restored.",
            metadata,
          };
        }

        if (restoreStatus.includes('ongoing-request="true"')) {
          return {
            isDownloadable: false,
            reason: "Restoration is in progress.",
            metadata,
          };
        }

        return {
          isDownloadable: true,
          reason: "Object is restored and downloadable.",
          metadata,
        };
      }

      if (storageClass === "ONEZONE_IA") {
        return {
          isDownloadable: true,
          reason:
            "Object is downloadable but frequent access via CloudFront may incur higher costs.",
          metadata,
        };
      }

      return {
        isDownloadable: true,
        reason: "Object is in a downloadable storage class.",
        metadata,
      };
    } catch (error: any) {
      logger.error("S3 issue");
      return {
        isDownloadable: false,
        reason: "Error retrieving metadata.",
      };
    }
  }

  async restoreObject(
    objectKey: string,
    sendLogToRenderer: (messgae: string) => void
  ) {
    try {
      const restoreCommand = new RestoreObjectCommand({
        Bucket: this.bucketName,
        Key: this.prefix + objectKey,
        RestoreRequest: {
          Days: 30,
        },
      });

      const response = await this.s3Client.send(restoreCommand);
      sendLogToRenderer(
        `Restore request initiated ${JSON.stringify(response)}`
      );
    } catch (error: any) {
      sendLogToRenderer(`Restoration Error !!! ${objectKey}`);
    }
  }
}
