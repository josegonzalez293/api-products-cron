import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiExtraModels, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import {
  DeletedPercentageDto,
  TopCategoriesDto,
  ProductsByDateRangeDto,
} from '../dtos/query-products-report.dto';
import { AuthService } from '../auth/auth.service';

@ApiTags('reports')
@ApiExtraModels(DeletedPercentageDto, TopCategoriesDto, ProductsByDateRangeDto)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly authService: AuthService,
  ) {}

  @Get('deleted-percentage')
  async getDeletedPercentage(
    @Headers('authorization') authHeader?: string,
  ): Promise<DeletedPercentageDto> {
    this.authService.verifyToken(authHeader);
    return this.reportsService.deletedPercentage();
  }

  @Get('products-by-date-range')
  @ApiQuery({
    name: 'filters',
    required: false,
    type: ProductsByDateRangeDto,
    style: 'form',
    explode: true,
  })
  async getProductsByDateRange(
    @Headers('authorization') authHeader?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('price') price?: boolean,
  ) {
    this.authService.verifyToken(authHeader);
    return this.reportsService.productsByDateRange(from, to, price);
  }

  @Get('top-categories')
  async getTopCategories(@Headers('authorization') authHeader?: string) {
    this.authService.verifyToken(authHeader);
    return this.reportsService.topCategories();
  }
}
