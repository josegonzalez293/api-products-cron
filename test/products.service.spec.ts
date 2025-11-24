import { ProductsService } from '../src/products/products.service';
import { Model } from 'mongoose';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productModelMock: Model<any>;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };
    delete process.env.PAGE_LIMIT;

    productModelMock = {
      find: jest.fn(),
      countDocuments: jest.fn(),
      findOne: jest.fn(),
    } as any;

    productsService = new ProductsService(productModelMock);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('findAll', () => {
    it('should apply default pagination when no query params are provided', async () => {
      const mockItems = [{ name: 'Product1' }, { name: 'Product2' }];
      (productModelMock.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockItems),
      });
      (productModelMock.countDocuments as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      const result = await productsService.findAll({});

      expect(productModelMock.find).toHaveBeenCalledWith({ deleted: false });
      expect(productModelMock.find().skip).toHaveBeenCalledWith(0);
      expect(productModelMock.find().limit).toHaveBeenCalledWith(5);
      expect(result).toEqual({
        total: 10,
        page: 1,
        pageCount: 2,
        items: mockItems,
      });
    });
  });

  describe('findOne', () => {
    it('should call findOne with correct externalId', async () => {
      const mockProduct = { name: 'Product1' };
      (productModelMock.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      });

      const result = await productsService.findOne('external-id-123');

      expect(productModelMock.findOne).toHaveBeenCalledWith({
        externalId: 'external-id-123',
        deleted: false,
      });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('remove', () => {
    it('should mark product as deleted if it exists', async () => {
      const mockProduct = {
        deleted: false,
        save: jest.fn(),
      };
      (productModelMock.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      });

      const result = await productsService.remove('external-id-123');

      expect(productModelMock.findOne).toHaveBeenCalledWith({
        externalId: 'external-id-123',
        deleted: false,
      });
      expect(mockProduct.deleted).toBe(true);
      expect(mockProduct.save).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return null if product does not exist', async () => {
      (productModelMock.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await productsService.remove('non-existent-id');

      expect(productModelMock.findOne).toHaveBeenCalledWith({
        externalId: 'non-existent-id',
        deleted: false,
      });
      expect(result).toBeNull();
    });
  });
});
