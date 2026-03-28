import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'New password',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'Password confirmation',
  })
  @IsString()
  @MinLength(8)
  passwordConfirm: string;
}
