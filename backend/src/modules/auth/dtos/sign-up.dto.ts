import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProfileType {
  PESSOA_FISICA = 'PESSOA_FISICA',
  PESSOA_JURIDICA = 'PESSOA_JURIDICA',
}

export class SignUpDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'User password (minimum 8 characters)',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Password confirmation',
  })
  @IsString()
  @MinLength(8)
  passwordConfirm: string;

  @ApiProperty({
    example: 'PESSOA_FISICA',
    description: 'Profile type',
    enum: ProfileType,
  })
  @IsEnum(ProfileType)
  @IsOptional()
  profileType?: ProfileType;
}
