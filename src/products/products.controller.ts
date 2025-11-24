import {
  Controller,
  Get,
  Param,
  Query,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiExtraModels, ApiQuery } from '@nestjs/swagger';
import { QueryProductsDto } from '../dtos/query-products.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@ApiExtraModels(QueryProductsDto)
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get('/')
  @ApiQuery({
    name: 'filters',
    required: false,
    type: QueryProductsDto,
    style: 'form',
    explode: true,
  })
  async findAll(@Query() query: QueryProductsDto) {
    return this.productService.findAll(query);
  }

  @Get(':externalId')
  async findOne(@Param('externalId') externalId: string) {
    const product = await this.productService.findOne(externalId);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  @Delete(':externalId')
  async remove(@Param('externalId') externalId: string) {
    const deleted = await this.productService.remove(externalId);
    if (!deleted) throw new NotFoundException('Product not found');
    return { success: true };
  }

  @Get('/health')
  healthCheck() {
    return { status: 'ok' };
  }
}
