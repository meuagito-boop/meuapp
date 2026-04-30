import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

function transformBoolean(value: unknown): boolean | undefined | unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }

    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'sim'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no', 'nao', 'não'].includes(normalized)) {
      return false;
    }
  }

  return value;
}

export class ListEstablishmentsQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  distance?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @Transform(({ value }) => transformBoolean(value))
  @IsBoolean()
  openNow?: boolean;
}
