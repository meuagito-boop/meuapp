import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'ID do destinatário',
    example: 'usr_123456',
  })
  @IsString()
  recipientId: string;
}
