import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUserId } from '@modules/auth/decorators/current-user.decorator';
import { AuthorizeResourceOwner } from '@modules/auth/decorators/authorize-resource.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ResourceOwnerGuard } from '@modules/auth/guards/resource-owner.guard';
import { MediaService } from '@modules/media/media.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller()
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly mediaService: MediaService
  ) {}

  @Get('establishments/:id/products')
  @ApiOperation({ summary: 'Listar produtos públicos de um estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  async listEstablishmentProducts(@Param('id') id: string) {
    return this.productsService.listEstablishmentProducts(id);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Obter detalhes públicos de um produto' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  async getProduct(@Param('id') id: string) {
    return this.productsService.getPublicProduct(id);
  }

  @Post('establishments/:id/products')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @AuthorizeResourceOwner({
    resource: 'establishment',
    param: 'id',
    message: 'Only the establishment owner can manage products.',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar item da vitrine pública' })
  @ApiResponse({ status: 201, description: 'Produto criado' })
  async createProduct(
    @Param('id') establishmentId: string,
    @CurrentUserId() userId: string,
    @Body() createProductDto: CreateProductDto
  ) {
    return this.productsService.createProduct(establishmentId, userId, createProductDto);
  }

  @Put('establishments/:id/products/:productId')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @AuthorizeResourceOwner({
    resource: 'establishment',
    param: 'id',
    message: 'Only the establishment owner can manage products.',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar item da vitrine' })
  async updateProduct(
    @Param('id') establishmentId: string,
    @Param('productId') productId: string,
    @CurrentUserId() userId: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.updateProduct(establishmentId, productId, userId, updateProductDto);
  }

  @Delete('establishments/:id/products/:productId')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @AuthorizeResourceOwner({
    resource: 'establishment',
    param: 'id',
    message: 'Only the establishment owner can manage products.',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Arquivar item da vitrine' })
  async deleteProduct(
    @Param('id') establishmentId: string,
    @Param('productId') productId: string,
    @CurrentUserId() userId: string
  ) {
    return this.productsService.deleteProduct(establishmentId, productId, userId);
  }

  @Post('establishments/:id/products/:productId/media')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @AuthorizeResourceOwner({
    resource: 'establishment',
    param: 'id',
    message: 'Only the establishment owner can manage product media.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    })
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload de imagem principal do produto' })
  async uploadProductMedia(
    @Param('id') establishmentId: string,
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUserId() userId: string,
    @Query('setAsMain') setAsMain: string | undefined
  ) {
    const uploadedMedia = await this.mediaService.uploadProductMedia(userId, productId, file);
    if (setAsMain !== 'false') {
      await this.productsService.registerProductMainImage(
        establishmentId,
        productId,
        userId,
        uploadedMedia.publicUrl
      );
    }

    return uploadedMedia;
  }
}
