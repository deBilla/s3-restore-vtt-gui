import { S3Operations } from "./media/s3.operations";

export async function restoreVttFromParent(parent: string, sendLogToRenderer: (messgae: string) => void) {
  const s3Operations = new S3Operations();
  await s3Operations.restoreVttFromParent(parent, sendLogToRenderer);
}
