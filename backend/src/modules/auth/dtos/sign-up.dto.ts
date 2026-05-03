import {
  Equals,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '@common/enums/account-type.enum';

export { AccountType as ProfileType };

export class SignUpDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({
    example: '1998-05-20',
    description: 'Birth date in YYYY-MM-DD format (must be 18+)',
  })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Optional full name (backend will compose from first + last)',
  })
  @IsString()
  @IsOptional()
  name?: string;

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
    example: 'USER',
    description: 'Profile type',
    enum: AccountType,
  })
  @IsEnum(AccountType)
  @IsOptional()
  profileType?: AccountType;

  @ApiProperty({
    example: true,
    description: 'Explicit acceptance of the current terms of use',
  })
  @IsBoolean()
  @Equals(true)
  termsAccepted: boolean;

  @ApiProperty({
    example: true,
    description: 'Explicit acceptance of the current privacy policy',
  })
  @IsBoolean()
  @Equals(true)
  privacyPolicyAccepted: boolean;
}
