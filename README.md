# Restore-VTT

This tool is used to restore VTT files using the parent path input from UI

## Test Run

```
npm start
```

Before building edit the `s3.utils.ts` file.

```
this.s3Client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: <>,
        secretAccessKey: <>,
      },
    });
```

## Build

```
npm run build
npm run dist
```