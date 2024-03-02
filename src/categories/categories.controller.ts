import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiProperty,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  PartialType
} from "@nestjs/swagger";
import { Role } from "src/auth/decorators/roles.decorator";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UserRole } from "src/shared/enums/userRole.enum";
import { CategoriesService } from "./categories.service";

export class Category {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  productsCount: number;

  @ApiProperty({ type: Date })
  createdAt: string;

  @ApiProperty({ type: Date })
  updatedAt: string;
}

export class CreateCategoryDTO {
  @ApiProperty()
  name: string;
}

export class UpdateCategoryDTO extends PartialType(CreateCategoryDTO) {}

@Controller("categories")
@ApiTags("categorias")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiResponse({ type: [Category] })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(":id")
  @ApiResponse({
    type: Category,
    status: 200,
  })
  async findById(@Param("id", new ParseIntPipe()) id: number) {
    return this.categoriesService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiForbiddenResponse({ description: "Usuário não tem função." })
  @ApiUnauthorizedResponse({ description: "Sem autorização." })
  @ApiBadRequestResponse({ description: "Algum valor do corpo é inválido." })
  @ApiConflictResponse({ description: "Nome já cadastrado." })
  @ApiCreatedResponse({
    type: Category,
    description: "Categoria criada com sucesso.",
  })
  async create(@Body() body: CreateCategoryDTO) {
    return this.categoriesService.create(body.name);
  }

  @Put(":id")
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: "Corpo invalido." })
  @ApiConflictResponse({ description: "Nome já cadastrado." })
  async update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() body: UpdateCategoryDTO
  ) {
    return this.categoriesService.update(id, body);
  }

  @Delete("all")
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  async deleteAll() {
    return this.categoriesService.deleteAll();
  }

  @Delete(':id')
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  async delete(@Param('id') id: number) {
    return this.categoriesService.delete(+id)
  }
}
