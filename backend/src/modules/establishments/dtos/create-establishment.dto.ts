import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsPhoneNumber } from 'class-validator';

export class CreateEstablishmentDto {
  @ApiProperty({
    description: 'Nome do estabelecimento',
    example: 'Bar do João',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descrição do estabelecimento',
    example: 'Bar tradicional com cerveja artesanal e comida mineira',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Categoria do estabelecimento',
    enum: ['bar', 'restaurant', 'nightclub', 'cafe', 'lounge', 'pub', 'other'],
    example: 'bar',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Endereço',
    example: 'Rua Augusta, 2500 - São Paulo, SP',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Telefone para contato',
    example: '+5511987654321',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Latitude do local',
    example: -23.5505,
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Longitude do local',
    example: -46.6333,
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Estabelecimento é público?',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
