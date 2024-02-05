import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
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
} from "@nestjs/swagger";
import { Role } from "src/auth/decorators/roles.decorator";
import { UserRole } from "src/shared/enums/userRole.enum";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";

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

@Controller("categories")
@ApiTags("categorias")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiResponse({ type: [Category] })
  async findAll() {
    return this.categoriesService.findAll();
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
}
