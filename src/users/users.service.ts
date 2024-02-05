import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { genSaltSync, hashSync } from "bcrypt";
import { PrismaService } from "src/prisma.service";
import { CreateUserDTO, UpdateUserDTO } from "./users.controller";

const select = {
  id: true,
  name: true,
  email: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, perPage = 15) {
    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        select,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.product.count(),
    ]);
    return { users, page, numberOfPages: Math.ceil(totalCount / perPage) };
  }

  async findMe(userId: number) {
    return await this.prisma.user.findUnique({ where: { id: userId }, select });
  }

  async findById(id: number) {
    return await this.prisma.user.findUnique({ where: { id }, select });
  }

  async create(data: CreateUserDTO) {
    let user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (user) {
      throw new ConflictException();
    }
    const salt = genSaltSync();
    const hash = hashSync(data.password, salt);
    return await this.prisma.user.create({
      data: {
        ...data,
        roleId: data.roleId ?? 1,
        salt,
        password: hash,
      },
      select,
    });
  }

  async update(id: number, userData: UpdateUserDTO) {
    let user = await this.prisma.user.findUnique({ where: { id } });
    const roleId = user.roleId;
    if (!user) {
      throw new NotFoundException();
    }
    user = await this.prisma.user.findFirst({
      where: { email: userData.email, NOT: { id } },
    });
    if (user) {
      throw new ConflictException();
    }
    return await this.prisma.user.update({
      where: { id },
      data: {
        name: userData.name,
        email: userData.email,
        ...(roleId === 2 ? undefined : { roleId: userData.roleId ?? roleId }),
        updatedAt: new Date(),
      },
      select,
    });
  }
}
