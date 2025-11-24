import { Logger } from '@nestjs/common';
import axios from 'axios';
import { CronService } from '../src/cron/cron.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CronService', () => {
  let cronService: CronService;
  let productModelMock: any;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };

    productModelMock = {
      findOne: jest.fn(),
      insertMany: jest.fn(),
      bulkWrite: jest.fn(),
    };

    cronService = new CronService(productModelMock);
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('fetchFromContentful', () => {
    it('should throw an error if env vars are missing', async () => {
      delete process.env.CONTENTFUL_URL;
      expect(() => cronService['getContentFullAPIConfig']()).toThrow(
        'An env var is missing',
      );
    });

    it('should return correct config if env vars are set', () => {
      process.env.CONTENTFUL_URL = 'https://cdn.contentful.com';
      process.env.CONTENTFUL_CONTENT_TYPE = 'product';
      process.env.CONTENTFUL_ENVIRONMENT = 'master';
      process.env.CONTENTFUL_ACCESS_TOKEN = 'someToken';
      process.env.CONTENTFUL_SPACE_ID = 'someSpaceId';

      const config = cronService['getContentFullAPIConfig']();
      expect(config.url).toBe(
        'https://cdn.contentful.com/spaces/someSpaceId/environments/master/entries?access_token=someToken&content_type=product',
      );
      expect(config.headers['Content-Type']).toBe('application/json');
    });

    it('should fetch products from Contentful', async () => {
      process.env.CONTENTFUL_URL = 'https://cdn.contentful.com';
      process.env.CONTENTFUL_CONTENT_TYPE = 'product';
      process.env.CONTENTFUL_ENVIRONMENT = 'master';
      process.env.CONTENTFUL_ACCESS_TOKEN = 'someToken';
      process.env.CONTENTFUL_SPACE_ID = 'someSpaceId';

      const mockProductsResponse = {
        data: {
          items: [{ sys: { id: '1' }, fields: {} }],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockProductsResponse);

      const products = await cronService['fetchFromContentful']();
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://cdn.contentful.com/spaces/someSpaceId/environments/master/entries?access_token=someToken&content_type=product',
        { headers: { 'Content-Type': 'application/json' } },
      );
      expect(products).toEqual(mockProductsResponse.data);
    });
  });

  describe('handleCron', () => {
    it('should fetch products and insert/update accordingly', async () => {
      process.env.CONTENTFUL_URL = 'https://cdn.contentful.com';
      process.env.CONTENTFUL_CONTENT_TYPE = 'product';
      process.env.CONTENTFUL_ENVIRONMENT = 'master';
      process.env.CONTENTFUL_ACCESS_TOKEN = 'someToken';
      process.env.CONTENTFUL_SPACE_ID = 'someSpaceId';

      const mockProductsResponse = {
        data: {
          items: [
            {
              sys: {
                id: '1',
                updatedAt: '2025-01-01',
                createdAt: '2024-12-01',
              },
              fields: { name: 'Product 1' },
              metadata: {},
            },
            {
              sys: {
                id: '2',
                updatedAt: '2025-01-02',
                createdAt: '2024-12-02',
              },
              fields: { name: 'Product 2' },
              metadata: {},
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockProductsResponse);

      productModelMock.findOne
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(null), // Product 1 does not exist
        })
        .mockReturnValueOnce({
          exec: jest
            .fn()
            .mockResolvedValue({ deleted: false, _id: 'existingId' }), // Product 2 exists
        });

      await cronService.handleCron();

      expect(productModelMock.insertMany).toHaveBeenCalledWith([
        {
          externalId: '1',
          updatedAt: new Date('2025-01-01'),
          createdAt: new Date('2024-12-01'),
          metadata: {},
          lastSyncedAt: expect.any(Date),
          name: 'Product 1',
        },
      ]);

      expect(productModelMock.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: 'existingId' },
            update: {
              $set: {
                metadata: {},
                updatedAt: new Date('2025-01-02'),
                lastSyncedAt: expect.any(Date),
                name: 'Product 2',
              },
            },
          },
        },
      ]);
    });
  });
});
