import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { NotFoundError } from "rxjs";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.category.findMany();
  }

  async findById(id: number) {
    const cat = await this.prisma.category.findUnique({ where: { id } })
    if (!cat) {
      throw new NotFoundException()
    }
    return cat;
  }

  async create(name: string) {
    const cat = await this.prisma.category.findUnique({ where: { name } });
    if (cat) {
      throw new ConflictException("Categoria já existe.");
    }
    return await this.prisma.category.create({ data: { name } });
  }
}
