import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, Min, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GlobalSearchDto {
  @ApiProperty({
    description: 'Termo de busca',
    example: 'festa',
  })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiProperty({
    description: 'Limite de itens por tipo (padrão: 5)',
    example: 5,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 5;
}
