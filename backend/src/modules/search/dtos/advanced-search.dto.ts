import { IsString, IsOptional, IsUUID, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdvancedSearchDto {
  @ApiProperty({
    description: 'Termo de busca',
    example: 'festa noturna',
    required: false,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: 'UUID do autor (filtro)',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiProperty({
    description: 'Ordenação dos resultados',
    example: 'recent',
    enum: ['recent', 'trending', 'mostLiked'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['recent', 'trending', 'mostLiked'])
  sortBy?: 'recent' | 'trending' | 'mostLiked' = 'recent';

  @ApiProperty({
    description: 'Número da página (padrão: 1)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Itens por página (padrão: 10)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;
}
