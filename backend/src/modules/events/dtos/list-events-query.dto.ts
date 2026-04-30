import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

export class ListEventsQueryDto extends PaginationDto {
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
}
