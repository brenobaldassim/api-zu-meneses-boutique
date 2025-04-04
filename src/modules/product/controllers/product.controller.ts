import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateProductRequestDto } from '../dtos/create-product-request.dto';
import { UpdateProductRequestDto } from '../dtos/update-product-request.dto';
import { ProductServiceContract } from '../services/contracts/product-service.contract';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductServiceContract) {}

  @Post()
  async create(@Body() body: CreateProductRequestDto) {
    return await this.productService.create(body);
  }

  @Get()
  async findAll() {
    return await this.productService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateProductRequestDto) {
    return await this.productService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productService.remove(id);
  }
}
