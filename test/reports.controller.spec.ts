import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from '../src/reports/reports.controller';
import { ReportsService } from '../src/reports/reports.service';
import { AuthService } from '../src/auth/auth.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  const mockService = {
    deletedPercentage: jest.fn().mockResolvedValue({ deleted: 10 }),
    productsByDateRange: jest.fn().mockResolvedValue([{ from: "2020-01-01", to: "2020-12-31", price: true }]),
    topCategories: jest.fn().mockResolvedValue([{ category: 'x', count: 2 }]),
  };

  const mockAuthService = {
    verifyToken: jest.fn().mockReturnValue(true),
  }; 

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportsService, useValue: mockService },
        { provide: AuthService, useValue: mockAuthService }
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should return deleted percentage', async () => {
    await expect(controller.getDeletedPercentage()).resolves.toEqual({
      deleted: 10,
    });
    expect(mockService.deletedPercentage).toHaveBeenCalled();
  });

  it('should return products by date range and forward params to service', async () => {
    const from = '2020-01-01';
    const to = '2020-12-31';
    const price = true;

    await expect(controller.getProductsByDateRange(undefined, from, to, price)).resolves.toEqual([
      { from: "2020-01-01", to: "2020-12-31", price: true },
    ]);
    expect(mockService.productsByDateRange).toHaveBeenCalledWith(
      from,
      to,
      price,
    );
  });

  it('should return top categories', async () => {
    await expect(controller.getTopCategories({} as any)).resolves.toEqual([
      { category: 'x', count: 2 },
    ]);
    expect(mockService.topCategories).toHaveBeenCalled();
  });
});
