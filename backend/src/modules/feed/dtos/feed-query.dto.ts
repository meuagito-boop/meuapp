import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FeedQueryDto {
  @ApiPropertyOptional({
    description: 'Numero da pagina (padrao: 1)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Itens por pagina (padrao: 10)',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Ordenacao do feed',
    enum: ['recent', 'trending', 'mostLiked'],
    default: 'recent',
  })
  @IsOptional()
  @IsEnum(['recent', 'trending', 'mostLiked'])
  sortBy?: 'recent' | 'trending' | 'mostLiked' = 'recent';
}
