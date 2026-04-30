import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Título da avaliação',
    example: 'Evento incrível!',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Conteúdo da avaliação',
    example: 'O evento foi muito bem organizado, muita gente legal e ambiente perfeito.',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Nota de 1 a 5',
    example: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}
