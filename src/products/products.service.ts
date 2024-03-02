import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { CreateProductDTO } from "./products.controller";
import * as fs from "fs";
import { randomUUID } from "crypto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, perPage = 15) {
    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        include: { category: true },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.product.count(),
    ]);
    return { products, page, numberOfPages: Math.ceil(totalCount / perPage) };
  }

  async search(productName: string) {
    const products = await this.prisma.product.findMany({
      include: { category: true },
      where: { name: { contains: productName } },
    });
    return products;
  }

  async findById(id: number) {
    return await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async create(data: CreateProductDTO) {
    const [product, category] = await Promise.all([
      this.prisma.product.findUnique({
        where: { name: data.name },
      }),
      this.prisma.category.findUnique({
        where: { id: +data.categoryId },
      }),
    ]);
    if (product) {
      throw new ConflictException("Produto já existe");
    }
    if (!category) {
      throw new BadRequestException("Categoria não existe");
    }
    const [p] = await this.prisma.$transaction([
      this.prisma.product.create({
        data: {
          ...data,
          categoryId: +data.categoryId,
          price: +data.price,
          stock: +data.stock,
        },
        include: {
          category: true,
        },
      }),
      this.prisma.category.update({
        where: { id: +data.categoryId },
        data: { productsCount: { increment: 1 } },
      }),
    ]);
    return p;
  }

  async uploadImage(productId: number, file: Express.Multer.File) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        throw new BadRequestException("Produto não existe");
      }
      if (product.imgSrc) {
        try {
          fs.unlinkSync(process.cwd() + `/public/${product.imgSrc}`);
        } catch (err) {
          // do nothing
        }
      }
      const extension = file.originalname.split(".").pop();
      const src = `/images/products/${randomUUID()}.${extension}`;
      fs.writeFileSync(process.cwd() + `/public${src}`, file.buffer);
      return await this.prisma.product.update({
        where: { id: productId },
        data: { imgSrc: src, updatedAt: new Date() },
      });
    } catch (err) {
      throw new InternalServerErrorException(err.name);
    }
  }

  async update(id: number, data: CreateProductDTO) {
    const [product, category] = await Promise.all([
      this.prisma.product.findUnique({
        where: { name: data.name, NOT: { id } },
      }),
      this.prisma.category.findUnique({
        where: { id: +data.categoryId },
      }),
    ]);
    if (!category) {
      throw new BadRequestException("Categoria não existe");
    }
    if (product) {
      throw new ConflictException("Produto já existe");
    }
    const categoryId = (await this.prisma.product.findUnique({ where: { id } }))
      .categoryId;
    const [, , p] = await this.prisma.$transaction([
      this.prisma.category.update({
        where: { id: category.id },
        data: { productsCount: { increment: 1 } },
      }),
      this.prisma.category.update({
        where: { id: categoryId },
        data: { productsCount: { decrement: 1 } },
      }),
      this.prisma.product.update({
        where: { id },
        data: { categoryId: +data.categoryId, description: data.description, name: data.name, price: +data.price, stock: +data.stock, updatedAt: new Date() },
        include: { category: true },
      }),
    ]);
    return p;
  }

  async deleteAll() {
    await this.prisma.product.deleteMany();
  }

  async delete(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    const categoryId = product.categoryId
    const [, p] = await this.prisma.$transaction([
      this.prisma.category.update({ where: { id: categoryId }, data: { productsCount: { decrement: 1 } } }),
      this.prisma.product.delete({ where: { id } })
    ])
    return p
  }
}
