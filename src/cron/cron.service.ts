import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Model, AnyBulkWriteOperation } from 'mongoose';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Products } from '../schemas/products.schema';
import { ContentfulProductListDto } from 'src/dtos/contentful-response.dto';

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);
  constructor(
    @InjectModel(Products.name) private productModel: Model<Products>,
  ) {}

  async onModuleInit() {
    try {
      await this.handleCron();
    } catch (err) {
      this.logger.error('Initial Contentful sync failed', err);
    }
  }

  private getContentFullAPIConfig() {
    const {
      CONTENTFUL_URL: apiUrl,
      CONTENTFUL_CONTENT_TYPE: type,
      CONTENTFUL_ENVIRONMENT: environment,
      CONTENTFUL_ACCESS_TOKEN: token,
      CONTENTFUL_SPACE_ID: spaceId,
    } = process.env;
    const missing = [apiUrl, type, environment, token, spaceId].some((v) => !v);

    if (missing) {
      throw new Error('An env var is missing');
    }

    return {
      url: `${apiUrl}/spaces/${spaceId}/environments/${environment}/entries?access_token=${token}&content_type=${type}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  @Cron('0 * * * *')
  async handleCron() {
    this.logger.log('Starting Contentful sync');
    try {
      const products = await this.fetchFromContentful();
      const toInsert: Array<Partial<Products>> = [];
      const toUpdate: AnyBulkWriteOperation<Products>[] = [];

      for (const p of products.items) {
        const { metadata, sys, fields } = p;
        const exist = await this.productModel
          .findOne({ externalId: sys.id })
          .exec();

        if (!exist) {
          toInsert.push({
            externalId: sys.id,
            updatedAt: new Date(sys.updatedAt),
            createdAt: new Date(sys.createdAt),
            metadata,
            lastSyncedAt: new Date(),
            ...fields,
          });
        } else {
          if (exist.deleted) {
            continue;
          } else {
            toUpdate.push({
              updateOne: {
                filter: { _id: exist._id },
                update: {
                  $set: {
                    metadata,
                    updatedAt: new Date(sys.updatedAt),
                    lastSyncedAt: new Date(),
                    ...fields,
                  },
                },
              },
            });
          }
        }
      }

      this.logger.log({ toInsert: toInsert.length, toUpdate: toUpdate.length });

      if (toInsert.length > 0) {
        await this.productModel.insertMany(toInsert);
      }

      if (toUpdate.length > 0) {
        await this.productModel.bulkWrite(toUpdate);
      }

      this.logger.log('Contentful sync finished');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error('Contentful sync failed', errorMessage);
    }
  }

  private async fetchFromContentful(): Promise<ContentfulProductListDto> {
    const { url, headers } = this.getContentFullAPIConfig();
    const products = await axios.get<ContentfulProductListDto>(url, {
      headers,
    });
    return products.data;
  }
}
