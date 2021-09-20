import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { execSync } from "child_process";
import {
  mkdtemp,
  remove,
  ensureDir,
  writeFile,
  stat,
  createReadStream,
} from "fs-extra";
import { tmpdir } from "os";
import { basename, join } from "path";
import { S3 } from "aws-sdk";

interface Request {
  inBucket?: string;
  inKey?: string;
  outBucket?: string;
  outKey?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { inBucket, inKey, outBucket, outKey } = JSON.parse(
      event.body ?? "{}"
    ) as Request;

    if (inBucket && inKey) {
      await main(inBucket, inKey, outBucket, outKey);

      return {
        statusCode: 200,
        body: JSON.stringify({}),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({}),
      };
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({}),
    };
  }
};

const main = async (
  inBucket: string,
  inKey: string,
  outBucket?: string,
  outKey?: string
) => {
  const tempDir = await mkdtemp(join(tmpdir(), "pdf-"));
  const outDir = join(tempDir, "out");
  await ensureDir(outDir);

  try {
    const s3 = new S3();
    const { Body: body } = await s3
      .getObject({
        Bucket: inBucket,
        Key: inKey,
      })
      .promise();

    const inFileName = basename(inKey);
    const inFilePath = join(tempDir, inFileName);
    await writeFile(inFilePath, body);

    execSync(`soffice --convert-to pdf --outdir "${outDir}" "${inFilePath}"`);

    const outFileName = inFileName.replace(/\.\w+$/, ".pdf");
    const outFilePath = join(tempDir, outFileName);
    const outFileStat = await stat(outFilePath);
    if (!outFileStat.isFile()) {
      throw new Error(`is not file: ${outFilePath}`);
    }

    const outFileStream = createReadStream(outFilePath);

    await s3
      .putObject({
        Bucket: outBucket ?? inBucket,
        Key: outKey ?? `${inKey}.pdf`,
        Body: outFileStream,
      })
      .promise();
  } finally {
    remove(tempDir);
  }
};
