import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateSaleRequestDto } from '../dtos/create-sale-request.dto';
import { UpdateSaleRequestDto } from '../dtos/update-sale-request.dto';
import { SaleServiceContract } from '../services/contract/sale-service.contract';

@Controller('sales')
export class SaleController {
  constructor(private readonly saleService: SaleServiceContract) {}

  @Post()
  async create(@Body() body: CreateSaleRequestDto) {
    return await this.saleService.create(body);
  }

  @Get()
  async findAll() {
    return await this.saleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.saleService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateSaleRequestDto) {
    return await this.saleService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.saleService.remove(id);
  }
}
