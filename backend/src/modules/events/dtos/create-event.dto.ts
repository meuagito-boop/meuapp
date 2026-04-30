import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'Nome do evento',
    example: 'Happy Hour no Bar do João',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descrição do evento',
    example: 'Happy hour com cerveja artesanal e músicas ao vivo',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Data do evento (ISO 8601)',
    example: '2024-02-15',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Hora de início (HH:mm)',
    example: '19:00',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'Hora de término (HH:mm)',
    example: '23:00',
  })
  @IsString()
  endTime: string;

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
    description: 'Categoria do evento',
    enum: ['nightlife', 'cultural', 'sports', 'gastronomic', 'party', 'other'],
    example: 'nightlife',
  })
  @IsString()
  category: string;

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
    example: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAttendees?: number;
}
