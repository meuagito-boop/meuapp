import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const AGITO_FEED_MODES = ['mixed', 'following', 'global', 'nearby'] as const;
export type AgitoFeedMode = (typeof AGITO_FEED_MODES)[number];

export class AgitoFeedQueryDto {
  @ApiPropertyOptional({
    description: 'Modo do feed social',
    enum: AGITO_FEED_MODES,
    default: 'mixed',
  })
  @IsOptional()
  @IsEnum(AGITO_FEED_MODES)
  mode?: AgitoFeedMode = 'mixed';

  @ApiPropertyOptional({
    description: 'Cursor opaco para paginacao incremental',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Limite de itens retornados',
    default: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(30)
  limit?: number = 15;

  @ApiPropertyOptional({
    description: 'Alias legado em portugues para limit',
    default: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(30)
  limite?: number;

  @ApiPropertyOptional({
    description: 'Alias legado em portugues para pagina',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pagina?: number = 1;
}
