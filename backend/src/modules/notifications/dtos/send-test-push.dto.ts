import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SendTestPushDto {
  @ApiPropertyOptional({
    example: 'Teste de push',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({
    example: 'Seu push AWS SNS esta funcionando.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  body?: string;
}
