import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findRoles() {
    return this.prisma.userRole.findMany({ select: { id: true, name: true } })
  }
}
