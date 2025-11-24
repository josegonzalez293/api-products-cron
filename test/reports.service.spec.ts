import { ReportsService } from '../src/reports/reports.service';
import { Model } from 'mongoose';

describe('ReportsService', () => {
  let reportsService: ReportsService;
  let productModelMock: Model<any>;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };

    productModelMock = {
      countDocuments: jest.fn(),
      find: jest.fn(),
      aggregate: jest.fn(),
    } as any;

    reportsService = new ReportsService(productModelMock);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('deletedPercentage', () => {
    it('should return correct deleted percentage', async () => {
      (productModelMock.countDocuments as jest.Mock).mockImplementation(
        ({ deleted } = {}) => {
          if (deleted === true) return { exec: jest.fn().mockResolvedValue(2) };
          return { exec: jest.fn().mockResolvedValue(10) };
        },
      );

      const result = await reportsService.deletedPercentage();

      expect(productModelMock.countDocuments).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ total: 10, deleted: 2, percentage: 20 });
    });
  });

  describe('productsByDateRange', () => {
    it('should return products within date range and price filter', async () => {
      const mockProducts = [{ name: 'Product1' }, { name: 'Product2' }];
      (productModelMock.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProducts),
      });

      const result = await reportsService.productsByDateRange(
        '2024-01-01',
        '2024-12-31',
        true,
      );

      expect(productModelMock.find).toHaveBeenCalledWith({
        deleted: false,
        createdAt: {
          $gte: new Date('2024-01-01'),
          $lte: new Date('2024-12-31'),
        },
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('topCategories', () => {
    it('should return top categories sorted by count', async () => {
      const mockCategories = [
        { category: 'Category1', count: 10 },
        { category: 'Category2', count: 8 },
      ];
      (productModelMock.aggregate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategories),
      });

      const result = await reportsService.topCategories();

      expect(productModelMock.aggregate).toHaveBeenCalledWith([
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
      ]);

      expect(result).toEqual([
        { category: 'Category1', count: 10 },
        { category: 'Category2', count: 8 },
      ]);
    });
  });
});
