import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '@modules/auth/decorators/current-user.decorator';
import { AgitoFeedQueryDto, AGITO_FEED_MODES } from './dtos/agito-feed-query.dto';

@ApiTags('Feed')
@Controller('feed')
export class AgitoFeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('agito')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter feed social T_AGITO',
    description:
      'Retorna o feed social com cursor pagination e modos following/global/nearby para o app mobile.',
  })
  @ApiQuery({
    name: 'mode',
    required: false,
    enum: AGITO_FEED_MODES,
    description: 'Escopo do feed social',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Cursor de paginacao incremental',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Quantidade de itens',
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Alias legado para limit',
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    type: Number,
    description: 'Alias legado para pagina compativel com clientes antigos',
  })
  @ApiResponse({
    status: 200,
    description: 'Feed social carregado com sucesso',
  })
  async getAgitoFeed(@CurrentUserId() userId: string, @Query() query: AgitoFeedQueryDto) {
    return this.feedService.getAgitoFeed(userId, query);
  }
}
