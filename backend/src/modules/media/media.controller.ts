import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MediaEntityType } from '@prisma/client';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUserId } from '@modules/auth/decorators/current-user.decorator';
import { MediaService } from './media.service';
import { MEDIA_ENTITY_ALIASES } from './media.constants';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload/:entityType')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    })
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload genérico de mídia para entidade' })
  @ApiParam({
    name: 'entityType',
    description: 'avatar | post | chat | event | establishment | product',
  })
  @ApiQuery({ name: 'entityId', required: false, description: 'ID da entidade vinculada' })
  async uploadEntityMedia(
    @Param('entityType') entityTypeRaw: string,
    @Query('entityId') entityId: string | undefined,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUserId() userId: string
  ) {
    const entityType = this.parseEntityType(entityTypeRaw);
    return this.mediaService.uploadMedia({
      ownerId: userId,
      entityType,
      entityId,
      file,
    });
  }

  @Post('products/:productId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    })
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de mídia de produto/vitrine' })
  async uploadProductMedia(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUserId() userId: string
  ) {
    return this.mediaService.uploadProductMedia(userId, productId, file);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Listar mídias de uma entidade' })
  @ApiParam({
    name: 'entityType',
    description: 'avatar | post | chat | event | establishment | product',
  })
  async listEntityMedia(
    @Param('entityType') entityTypeRaw: string,
    @Param('entityId') entityId: string
  ) {
    const entityType = this.parseEntityType(entityTypeRaw);
    return this.mediaService.listEntityMedia(entityType, entityId);
  }

  @Get('protected/:mediaId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Servir mÃ­dia protegida mediante autorizaÃ§Ã£o' })
  async serveProtectedMedia(
    @Param('mediaId') mediaId: string,
    @CurrentUserId() userId: string,
    @Res() response: Response
  ) {
    const file = await this.mediaService.resolveProtectedMedia(mediaId, userId);
    if (file.absolutePath) {
      return response.type(file.mimeType).sendFile(file.absolutePath);
    }

    return response.type(file.mimeType).send(file.buffer);
  }

  @Get('public/:mediaId')
  @ApiOperation({ summary: 'Servir mídia pública armazenada em S3/local' })
  async servePublicMedia(@Param('mediaId') mediaId: string, @Res() response: Response) {
    const file = await this.mediaService.resolvePublicMedia(mediaId);
    if (file.absolutePath) {
      return response.type(file.mimeType).sendFile(file.absolutePath);
    }

    return response.type(file.mimeType).send(file.buffer);
  }

  @Get('local/:folder/:filename')
  @ApiOperation({ summary: 'Servir mídia local (fallback de desenvolvimento)' })
  async serveLocalMedia(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() response: Response
  ) {
    const file = await this.mediaService.resolveLocalMediaFile(folder, filename);
    return response.type(file.mimeType).sendFile(file.absolutePath);
  }

  private parseEntityType(value: string): MediaEntityType {
    const normalized = value.trim().toLowerCase();
    const aliased = MEDIA_ENTITY_ALIASES[normalized];
    if (aliased) {
      return aliased;
    }

    const upperCased = value.trim().toUpperCase() as MediaEntityType;
    if (Object.values(MediaEntityType).includes(upperCased)) {
      return upperCased;
    }

    throw new BadRequestException(`entityType inválido: ${value}`);
  }
}
