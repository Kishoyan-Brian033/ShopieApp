import { Injectable, NotFoundException } from '@nestjs/common';
import { getPrismaClient } from '../prisma/prisma.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update.cart.dto';

@Injectable()
export class CartService {
  private prisma = getPrismaClient();


  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    // Check if the cart exists for the user, create if not
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Check if the product is already in the cart
    const existingCartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingCartItem) {
      // Update quantity
      return this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      // Add new cart item
      return this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }
  }

  async updateCartItem(userId: string, productId: string, updateCartItemDto: UpdateCartItemDto) {
    const { quantity } = updateCartItemDto;

    const cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });
  }

  async removeCartItem(userId: string, productId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });
  }

  async getCartItems(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        CartItem: true,
      },
    });

    if (!cart) {
      return [];
    }

    return cart.CartItem;
  }
}
