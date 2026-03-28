import { IsEmail, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProfileType {
  PESSOA_FISICA = 'PESSOA_FISICA',
  PESSOA_JURIDICA = 'PESSOA_JURIDICA',
}

export class UpdateUserDto {
  @ApiProperty({
    example: 'newemail@example.com',
    description: 'User email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'John Doe Updated',
    description: 'User name',
    required: false,
  })
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'PESSOA_FISICA',
    description: 'Profile type',
    enum: ProfileType,
    required: false,
  })
  @IsEnum(ProfileType)
  @IsOptional()
  profileType?: ProfileType;
}
