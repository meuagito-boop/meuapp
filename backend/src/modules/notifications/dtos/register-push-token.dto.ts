import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { PushPlatform } from '@prisma/client';

export class RegisterPushTokenDto {
  @ApiProperty({
    enum: PushPlatform,
    example: PushPlatform.ANDROID,
  })
  @IsEnum(PushPlatform)
  platform: PushPlatform;

  @ApiProperty({
    example: 'fcm-or-apns-device-token',
  })
  @IsString()
  @MinLength(10)
  deviceToken: string;

  @ApiPropertyOptional({
    example: 'arn:aws:sns:us-east-1:123456789012:app/GCM/meu-agito-android',
  })
  @IsOptional()
  @IsString()
  platformApplicationArn?: string;
}
