import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/shared/enums/userRole.enum';
import { RolesService } from './roles.service';
import { Role } from "src/auth/decorators/roles.decorator";

class RoleResponse {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string
}

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: [RoleResponse] })
  async findRoles() {
    return this.rolesService.findRoles()
  }
}
