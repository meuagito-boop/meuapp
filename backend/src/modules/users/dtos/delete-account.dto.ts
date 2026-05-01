import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Current account password',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
