import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../src/products/products.controller';
import { ProductsService } from '../src/products/products.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  const mockService = {
    findAll: jest.fn().mockResolvedValue([{ id: '1' }]),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    jest.clearAllMocks();
  });

  it('should return list from findAll', async () => {
    const query = { limit: 10 } as any;
    await expect(controller.findAll(query)).resolves.toEqual([{ id: '1' }]);
    expect(mockService.findAll).toHaveBeenCalledWith(query);
  });

  it('should return product when found', async () => {
    mockService.findOne.mockResolvedValueOnce({ id: '1' });
    await expect(controller.findOne('ext-1')).resolves.toEqual({ id: '1' });
    expect(mockService.findOne).toHaveBeenCalledWith('ext-1');
  });

  it('should throw NotFoundException when product not found', async () => {
    mockService.findOne.mockResolvedValueOnce(null);
    await expect(controller.findOne('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return success when remove returns true', async () => {
    mockService.remove.mockResolvedValueOnce(true);
    await expect(controller.remove('ext-1')).resolves.toEqual({
      success: true,
    });
    expect(mockService.remove).toHaveBeenCalledWith('ext-1');
  });

  it('should throw NotFoundException when remove returns false', async () => {
    mockService.remove.mockResolvedValueOnce(false);
    await expect(controller.remove('missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
