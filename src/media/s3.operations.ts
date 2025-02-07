import configurations from "../core/configurations";
import { S3Utils } from "../core/s3.utils";

export class S3Operations {
  s3Utils: S3Utils;

  constructor() {
    this.s3Utils = new S3Utils(configurations().s3.bucket.media.name, configurations().s3.bucket.media.prefix);
  }

  async restoreVttFromParent(parent: string, sendLogToRenderer: (messgae: string) => void): Promise<string[]> {
    sendLogToRenderer(`🔴 Parent path: ${parent}`);
    const restoreList: string[] = [];
    const keys = await this.s3Utils.getChildKeys(parent);

    sendLogToRenderer(`🔴 Keys for the parent: ${keys}`);

    for (const key of keys) {
      if (key.includes('.vtt') || key.includes('.srt')) {
        const keyInfo = await this.s3Utils.getS3KeyMetadata(key, sendLogToRenderer);
        sendLogToRenderer(`🔴 Checking key: ${key} - Downloadable: ${keyInfo.isDownloadable}`);

        if (!keyInfo.isDownloadable) {
          restoreList.push(key);
        }
      }
    }

    sendLogToRenderer(`🔴 Restore List: ${restoreList}`);
    return restoreList;
  }
}