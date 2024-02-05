import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.category.findMany();
  }

  async create(name: string) {
    const cat = await this.prisma.category.findUnique({ where: { name } });
    if (cat) {
      throw new ConflictException("Categoria já existe.");
    }
    return await this.prisma.category.create({ data: { name } });
  }
}
