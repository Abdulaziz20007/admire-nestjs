import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

@Injectable()
export class CloudflareService {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly publicDomain: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>(
      "CLOUDFLARE_ACCESS_KEY_ID"
    );
    const secretAccessKey = this.configService.get<string>(
      "CLOUDFLARE_SECRET_ACCESS_KEY"
    );
    const endpoint = this.configService.get<string>("CLOUDFLARE_ENDPOINT");
    const bucketName = this.configService.get<string>("CLOUDFLARE_BUCKET_NAME");
    const publicDomain = this.configService.get<string>(
      "CLOUDFLARE_PUBLIC_DOMAIN"
    );

    if (
      !accessKeyId ||
      !secretAccessKey ||
      !endpoint ||
      !bucketName ||
      !publicDomain
    ) {
      throw new InternalServerErrorException(
        "Cloudflare credentials are not configured."
      );
    }

    this.bucketName = bucketName;
    this.publicDomain = publicDomain;

    this.s3 = new S3Client({
      endpoint,
      region: "auto",
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string) {
    const key = `${folder}/${uuid()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    // Return the publicly accessible URL to be stored in the DB
    return `https://${this.publicDomain}/${key}`;
  }

  async deleteFile(url: string) {
    if (!url) {
      return;
    }
    let key: string;
    if (url.startsWith("http")) {
      key = new URL(url).pathname.substring(1); // remove leading slash
    } else {
      key = url.startsWith("/") ? url.substring(1) : url;
    }

    if (key) {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: key })
      );
    }
  }
}
