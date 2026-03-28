import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Conteúdo do comentário',
    example: 'Ótimo post! Vou nessa noite!',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1, { message: 'Comment must not be empty' })
  @MaxLength(500, { message: 'Comment must be less than 500 characters' })
  content: string;
}
