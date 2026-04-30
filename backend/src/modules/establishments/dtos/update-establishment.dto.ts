import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject, IsUrl, IsNumber } from 'class-validator';

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
    description: 'Subcategoria',
    example: 'hamburgueria',
    required: false,
  })
  @IsOptional()
  @IsString()
  subcategory?: string;

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
    description: 'WhatsApp do estabelecimento',
    example: '+5511999999999',
    required: false,
  })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiProperty({
    description: 'Website público',
    example: 'https://bar-do-joao.com.br',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'Latitude atualizada do estabelecimento',
    example: -23.5505,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({
    description: 'Longitude atualizada do estabelecimento',
    example: -46.6333,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    description: 'Estabelecimento é público?',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Horários de funcionamento por dia/turno',
    example: {
      monday: [{ opensAt: '09:00', closesAt: '18:00' }],
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  openingHours?: Record<string, unknown>;
}
