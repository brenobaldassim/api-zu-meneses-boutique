import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleRequestDto } from '../dtos/create-sale-request.dto';
import { UpdateSaleRequestDto } from '../dtos/update-sale-request.dto';
import { SaleEntity } from '../entities/sale.entity';
import { SaleServiceContract } from './contract/sale-service.contract';
import { PrismaService } from '@src/modules/prisma/services/prisma.service';

@Injectable()
export class SaleService implements SaleServiceContract {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateSaleRequestDto): Promise<SaleEntity> {
    const client = await this.prisma.client.findUnique({
      where: { id: body.clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const quantityByProductId = new Map(
      body.products.map((item) => [item.productId, item.quantity]),
    );

    const products = await this.prisma.product.findMany({
      where: { id: { in: body.products.map((item) => item.productId) } },
    });

    if (products.length !== body.products.length) {
      const foundIds = new Set(products.map((product) => product.id));
      const notFoundIds = body.products
        .map((p) => p.productId)
        .filter((id) => !foundIds.has(id));

      throw new NotFoundException(
        `Products with ids ${notFoundIds.join(', ')} not found`,
      );
    }

    const calculatedTotalAmountCents = products.reduce((sum, product) => {
      const quantity = quantityByProductId.get(product.id) || 0;
      return sum + product.priceCents * quantity;
    }, 0);

    const sale = await this.prisma.sale.create({
      data: {
        clientId: body.clientId,
        totalAmountCents: calculatedTotalAmountCents,
        saleDate: body.saleDate,
        saleProducts: {
          create: body.products.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });

    return sale;
  }

  async findAll(): Promise<SaleEntity[]> {
    return await this.prisma.sale.findMany({
      include: {
        client: true,
        saleProducts: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        saleDate: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<SaleEntity> {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        client: true,
        saleProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  async update(id: string, body: UpdateSaleRequestDto): Promise<SaleEntity> {
    await this.findOne(id);

    if (body.products && body.products.length > 0) {
      const products = await this.prisma.product.findMany({
        where: {
          id: {
            in: body.products.map((item) => item.productId),
          },
        },
      });

      if (products.length !== body.products.length) {
        const foundIds = new Set(products.map((product) => product.id));
        const notFoundIds = body.products
          .map((p) => p.productId)
          .filter((id) => !foundIds.has(id));

        throw new NotFoundException(
          `Products with ids ${notFoundIds.join(', ')} not found`,
        );
      }

      const quantityByProductId = new Map(
        body.products.map((item) => [item.productId, item.quantity]),
      );

      const calculatedTotalAmountCents = products.reduce((sum, product) => {
        const quantity = quantityByProductId.get(product.id) || 0;
        return sum + product.priceCents * quantity;
      }, 0);

      const updatedSale = await this.prisma.sale.update({
        where: { id },
        data: {
          clientId: body.clientId,
          saleDate: body.saleDate,
          totalAmountCents: calculatedTotalAmountCents,
          saleProducts: {
            deleteMany: {},
            create: body.products.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          client: true,
          saleProducts: {
            include: {
              product: true,
            },
          },
        },
      });

      return updatedSale;
    }

    return await this.prisma.sale.update({
      where: { id },
      data: {
        clientId: body.clientId,
        saleDate: body.saleDate,
      },
      include: {
        client: true,
        saleProducts: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<SaleEntity> {
    await this.findOne(id);

    return await this.prisma.sale.delete({
      where: { id },
      include: {
        client: true,
        saleProducts: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}
