import { IsString, IsUrl, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'This is my bio',
    description: 'User bio',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    example: 'São Paulo, SP',
    description: 'User location',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: 'https://example.com',
    description: 'Website URL',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  website?: string;
}
