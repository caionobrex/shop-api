import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
  OmitType,
  PartialType,
} from "@nestjs/swagger";
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { Role } from "src/auth/decorators/roles.decorator";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UserRole } from "src/shared/enums/userRole.enum";
import { UsersService } from "./users.service";
import { Request as ExpressRequest } from "express";

class RoleData {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

class User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: RoleData })
  role: RoleData;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class UsersResponse {
  @ApiProperty({ type: User, isArray: true })
  users: User[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  numberOfPages: number;
}

export class CreateUserDTO {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  password: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  roleId?: number;
}

export class UpdateUserDTO extends PartialType(
  OmitType(CreateUserDTO, ["password"] as const)
) {}

@ApiTags('usuários')
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiResponse({ type: UsersResponse })
  @ApiQuery({
    required: false,
    name: "page",
    type: "number",
    schema: { minimum: 1 },
  })
  @ApiQuery({
    required: false,
    name: "perPage",
    type: "number",
    schema: { minimum: 1 },
  })
  async findAll(
    @Query(
      "page",
      new ParseIntPipe({ optional: true }),
      new DefaultValuePipe(1)
    )
    page?: number,
    @Query(
      "perPage",
      new ParseIntPipe({ optional: true }),
      new DefaultValuePipe(15)
    )
    perPage?: number
  ) {
    return this.usersService.findAll(page, perPage);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  @ApiResponse({ type: User })
  async findMe(@Request() req: ExpressRequest & { user: any }) {
    return this.usersService.findMe(req.user.sub);
  }

  @Get(":id")
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiResponse({ type: User })
  async findById(@Param("id", new ParseIntPipe()) id: number) {
    return this.usersService.findById(id);
  }

  @Post()
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiResponse({ type: User })
  async create(@Body() body: CreateUserDTO) {
    return this.usersService.create(body);
  }

  @Put(":id")
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiResponse({ type: User })
  async update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() body: UpdateUserDTO
  ) {
    return this.usersService.update(id, body);
  }

  @Delete("all")
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  async deleteAll() {
    return this.usersService.deleteAll();
  }

  @Delete(":id")
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  async delete(
    @Param("id", new ParseIntPipe()) id: number,
  ) {
    return this.usersService.delete(id);
  }
}
