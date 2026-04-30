import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Conteúdo do post',
    example: 'Este é um post incrível sobre a noite',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1, { message: 'Post content must not be empty' })
  @MaxLength(2000, { message: 'Post content must be less than 2000 characters' })
  content: string;

  @ApiProperty({
    description: 'Se o post é público ou privado',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;

  @ApiProperty({
    description: 'URLs de imagens do post',
    example: ['https://cdn.meuagito.com/post-media/abc.jpg'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiProperty({
    description: 'Alias legado para imageUrls',
    example: ['https://cdn.meuagito.com/post-media/abc.jpg'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  images?: string[];
}
