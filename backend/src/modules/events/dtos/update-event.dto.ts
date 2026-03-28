import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class UpdateEventDto {
  @ApiProperty({
    description: 'Nome do evento',
    example: 'Happy Hour atualizado',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Descrição do evento',
    example: 'Atualização da descrição',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Data do evento (ISO 8601)',
    example: '2024-02-16',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    description: 'Hora de início (HH:mm)',
    example: '20:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({
    description: 'Hora de término (HH:mm)',
    example: '00:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({
    description: 'Categoria do evento',
    enum: ['nightlife', 'cultural', 'sports', 'gastronomic', 'party', 'other'],
    example: 'party',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Evento é público?',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Número máximo de participantes',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAttendees?: number;
}
