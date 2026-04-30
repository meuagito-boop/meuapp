import { IsEmail, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@common/enums/account-type.enum';

export { AccountType as ProfileType };

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User name',
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'User password',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'USER',
    description: 'Profile type',
    enum: AccountType,
  })
  @IsEnum(AccountType)
  @IsOptional()
  profileType?: AccountType;
}
