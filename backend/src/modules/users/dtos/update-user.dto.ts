import { IsEmail, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@common/enums/account-type.enum';

export { AccountType as ProfileType };

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
    example: 'USER',
    description: 'Profile type',
    enum: AccountType,
    required: false,
  })
  @IsEnum(AccountType)
  @IsOptional()
  profileType?: AccountType;
}
