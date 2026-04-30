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

export class UpdatePostDto {
  @ApiProperty({
    description: 'Novo conteúdo do post',
    example: 'Post atualizado com mais informações',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content?: string;

  @ApiProperty({
    description: 'Atualizar visibilidade do post',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

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
