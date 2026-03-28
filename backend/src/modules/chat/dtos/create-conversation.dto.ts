import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'ID do destinatário',
    example: 'usr_123456',
  })
  @IsString()
  @IsUUID()
  recipientId: string;
}
