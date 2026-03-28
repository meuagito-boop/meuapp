import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdateEstablishmentDto {
  @ApiProperty({
    description: 'Nome do estabelecimento',
    example: 'Bar do João - Unidade Vila Mariana',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Descrição atualizada',
    example: 'Melhorado com novas bebidas',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Categoria',
    enum: ['bar', 'restaurant', 'nightclub', 'cafe', 'lounge', 'pub', 'other'],
    example: 'lounge',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Novo endereço',
    example: 'Av. Paulista, 1000 - São Paulo, SP',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Novo telefone',
    example: '+5511912345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Estabelecimento é público?',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
