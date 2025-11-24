import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';

export class LinkSysDto {
  @IsString()
  type: string;

  @IsString()
  linkType: string;

  @IsString()
  id: string;
}

export class SpaceDto {
  @ValidateNested()
  @Type(() => LinkSysDto)
  sys: LinkSysDto;
}

export class ContentTypeDto {
  @ValidateNested()
  @Type(() => LinkSysDto)
  sys: LinkSysDto;
}

export class EnvironmentDto {
  @ValidateNested()
  @Type(() => LinkSysDto)
  sys: LinkSysDto;
}

export class SysDto {
  @ValidateNested()
  @Type(() => SpaceDto)
  space: SpaceDto;

  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;

  @ValidateNested()
  @Type(() => EnvironmentDto)
  environment: EnvironmentDto;

  @IsOptional()
  @IsInt()
  publishedVersion?: number;

  @IsOptional()
  @IsInt()
  revision?: number;

  @ValidateNested()
  @Type(() => ContentTypeDto)
  contentType: ContentTypeDto;

  @IsOptional()
  @IsString()
  locale?: string;
}

export class MetadataDto {
  @IsArray()
  @IsOptional()
  tags: any[];

  @IsArray()
  @IsOptional()
  concepts: any[];
}

export class ProductFieldsDto {
  @IsOptional()
  @IsInt()
  sku?: number;

  @IsDefined()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}

export class ContentfulProductDto {
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata: MetadataDto;

  @ValidateNested()
  @Type(() => SysDto)
  sys: SysDto;

  @ValidateNested()
  @Type(() => ProductFieldsDto)
  fields: ProductFieldsDto;
}

export class ContentfulProductListDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentfulProductDto)
  items: ContentfulProductDto[];
}
