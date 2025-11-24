import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { Products, ProductSchema } from 'src/schemas/products.schema';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { CronService } from './cron/cron.service';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        return {
          uri,
        };
      },
    }),
    MongooseModule.forFeature([{ name: Products.name, schema: ProductSchema }]),
    ScheduleModule.forRoot(),
    AuthModule,
    ReportsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, CronService],
})
export class AppModule {}
