import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nome do produto ou serviço',
    example: 'Combo burger artesanal',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descrição pública do item',
    example: 'Pão brioche, burger 180g e fritas crocantes',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Categoria interna da vitrine',
    example: 'Lanches',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Preço do item para exibição na vitrine',
    example: 39.9,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    description: 'Status público do produto',
    enum: ProductStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
