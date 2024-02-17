import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}

  async findCart(userId: number) {
    return this.prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  async addItem(productId: number, quantity: number, userId: number) {
    const [cart, product] = await Promise.all([
      this.prisma.cart.findFirst({
        where: { userId },
        include: { items: true },
      }),
      this.prisma.product.findUnique({ where: { id: productId } }),
    ]);
    if (!product) {
      throw new NotFoundException("Produto não encontrado.");
    }
    if (cart.items.find(({ productId: id }) => id === productId)) {
      throw new ConflictException("Produto já está no carrinho.");
    }
    const [item] = await this.prisma.$transaction([
      this.prisma.cartItem.create({
        data: {
          productId,
          quantity,
          cartId: cart.id,
          subTotal: product.price * quantity,
        },
        include: { product: true },
      }),
      this.prisma.cart.update({
        where: { id: cart.id },
        data: { total: cart.total + product.price * quantity },
      }),
    ]);
    return item;
  }

  async updateItem(productId: number, quantity: number, userId: number) {
    const [cart, product] = await Promise.all([
      this.prisma.cart.findFirst({
        where: { userId },
        include: { items: true },
      }),
      this.prisma.product.findUnique({ where: { id: productId } }),
    ]);
    if (!product) {
      throw new NotFoundException("Produto não encontrado.");
    }
    cart.total = cart.total - cart.items.find((item) => item.productId === productId).subTotal
    const [item] = await this.prisma.$transaction([
      this.prisma.cartItem.update({
        where: { productId_cartId: { cartId: cart.id, productId } },
        data: {
          quantity,
          subTotal: product.price * quantity,
        },
        include: { product: true },
      }),
      this.prisma.cart.update({
        where: { id: cart.id },
        data: { total: cart.total + product.price * quantity },
      }),
    ]);
    return item;
  }

  async deleteItem(userId: number, itemId: number) {
    const cart = await this.findCart(userId);
    const item = cart.items.find(({ productId }) => productId === itemId);
    if (!item) {
      throw new NotFoundException("Item não encontrado no carrinho.");
    }
    await this.prisma.$transaction([
      this.prisma.cartItem.delete({
        where: { productId_cartId: { cartId: cart.id, productId: itemId } },
      }),
      this.prisma.cart.update({
        where: { id: cart.id },
        data: { total: cart.total - item.subTotal },
      }),
    ]);
  }
}
