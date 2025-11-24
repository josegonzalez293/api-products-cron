import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Products } from '../schemas/products.schema';
import { QueryProductsDto } from '../dtos/query-products.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Products.name) private productModel: Model<Products>,
  ) {}

  private readonly pageLimit: number = process.env.PAGE_LIMIT
    ? parseInt(process.env.PAGE_LIMIT)
    : 5;

  async findAll(query: QueryProductsDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const skip = (page - 1) * this.pageLimit;

    const filter: FilterQuery<Products> = { deleted: false };

    if (query.minPrice != null || query.maxPrice != null) {
      const filteredPrice: { $gte?: number; $lte?: number } = {};
      if (query.minPrice != null) {
        const min = Number(query.minPrice);
        if (isNaN(min))
          throw new BadRequestException('minPrice must be a number');
        filteredPrice.$gte = min;
      }
      if (query.maxPrice != null) {
        const max = Number(query.maxPrice);
        if (isNaN(max))
          throw new BadRequestException('maxPrice must be a number');
        filteredPrice.$lte = max;
      }
      filter.price = filteredPrice;
    }

    if (query.name) {
      filter['name'] = { $regex: query.name, $options: 'i' };
    }

    if (query.category) {
      filter['category'] = query.category;
    }

    const [items, total] = await Promise.all([
      this.productModel.find(filter).skip(skip).limit(this.pageLimit).exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    this.logger.log(
      `findAll: Retrieved ${items.length} items out of ${total} total, pageLimit ${this.pageLimit}`,
    );

    return {
      total,
      page,
      pageCount: Math.ceil(total / this.pageLimit),
      items,
    };
  }

  async findOne(externalId: string) {
    return this.productModel.findOne({ externalId, deleted: false }).exec();
  }

  async remove(externalId: string) {
    const product = await this.productModel
      .findOne({ externalId, deleted: false })
      .exec();
    if (!product) return null;

    product.deleted = true;
    product.deletedAt = new Date();
    await product.save();
    return true;
  }
}
