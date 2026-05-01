import { Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UsernameAvailabilityQueryDto {
  @ApiProperty({
    example: 'joao.silva',
    description: 'Username to check',
  })
  @Matches(/^[a-zA-Z0-9._]{3,30}$/, {
    message:
      'Username must be 3-30 characters and contain only letters, numbers, dots or underscores',
  })
  username: string;
}
