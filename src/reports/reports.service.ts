import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Products } from '../schemas/products.schema';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel(Products.name) private productModel: Model<Products>,
  ) {}

  async deletedPercentage() {
    const total = await this.productModel.countDocuments().exec();
    const deleted = await this.productModel
      .countDocuments({ deleted: true })
      .exec();
    const percentage = total === 0 ? 0 : (deleted / total) * 100;
    return { total, deleted, percentage };
  }

  async productsByDateRange(
    from?: string,
    to?: string,
    price?: boolean,
  ): Promise<Products[]> {
    const query: FilterQuery<Products> = { deleted: false };
    if (from || to) {
      const createdAtFilter: Partial<Record<'$gte' | '$lte', Date>> = {};
      if (from) {
        createdAtFilter.$gte = new Date(from);
      }
      if (to) {
        createdAtFilter.$lte = new Date(to);
      }
      query.createdAt = createdAtFilter;
    }

    let q = this.productModel.find(query);
    if (!price) {
      // if price is flase o undefined exclude price from the result
      q = q.select('-price');
    }

    const products = await q.exec();
    return products;
  }

  async topCategories(): Promise<
    Array<{ category: string | null; count: number }>
  > {
    const categories = await this.productModel
      .aggregate<{ category: string | null; count: number }>([
        { $match: { deleted: false } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            count: 1,
            category: '$_id',
          },
        },
        { $sort: { count: -1 } },
      ])
      .exec();
    this.logger.log(
      `topCategories: Retrieved top ${categories.length} categories`,
    );
    return categories.map((c) => ({ category: c.category, count: c.count }));
  }
}
