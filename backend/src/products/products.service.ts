/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getPrismaClient } from 'src/prisma/prisma.service';
import { CreateProducts } from 'src/dto/create-product.dto';
import { UpdateProducts } from 'src/dto/update-product.dto';

@Injectable()
export class ProductsService {
  private prisma = getPrismaClient();

  async createProduct(data: CreateProducts) {
    try {
    
      const product = await this.prisma.product.create({
        data: {
          ...data,
          price: data.price,
          image: data.image,
          stock: data.stock ?? 0,
        },
      });
      return product;
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          'Error creating product: ' + error.message,
        );
      }
      throw new InternalServerErrorException('Error creating product');
    }
  }

  async findAll() {
    try {
      const products = await this.prisma.product.findMany({
        orderBy: { id: 'asc' },
      });
      return products;
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          'Failed to find products: ' + error.message,
        );
      }
      throw new InternalServerErrorException('Failed to find products');
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });
      if (!product) {
        throw new InternalServerErrorException(
          'Product with id ' + id + ' not found',
        );
      }
      return product;
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          'Failed to find product: ' + error.message,
        );
      }
      throw new InternalServerErrorException('Failed to find product');
    }
  }

  async updateProduct(id: string, data: UpdateProducts) {
    try {
      const updateData = {
        ...data,
        price: data.price ? data.price : undefined,
      };
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: updateData,
      });
      return updatedProduct;
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          'Failed to update product: ' + error.message,
        );
      }
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async deleteProduct(id: string) {
    try {
      await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          'Failed to delete product: ' + error.message,
        );
      }
      throw new InternalServerErrorException('Failed to delete product');
    }
  }

  async findByPriceRange(minPrice: number, maxPrice: number) {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          price: {
            gte: (minPrice * 100).toString(),
            lte: (maxPrice * 100).toString(),
          },
        },
        orderBy: { price: 'asc' },
      });
      return products;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to find products by price range',
      );
    }
  }

  async findWithPagination(skip: number, take: number) {
    try {
      const products = await this.prisma.product.findMany({
        skip,
        take,
        orderBy: { id: 'asc' },
      });
      return products;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to find products with pagination',
      );
    }
  }
}
