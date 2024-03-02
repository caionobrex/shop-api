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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { ProductsService } from "./products.service";
import { Role } from "src/auth/decorators/roles.decorator";
import { UserRole } from "src/shared/enums/userRole.enum";
import { FileInterceptor } from "@nestjs/platform-express/multer";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Category } from "src/categories/categories.controller";

export class CreateProductDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  stock: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  categoryId: number;
}

export class Product {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  imgSrc: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  stock: number;

  @ApiProperty({ type: Category })
  category: Category;
}

export class ProductsResponse {
  @ApiProperty({ type: Product, isArray: true })
  products: Product[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  numberOfPages: number;
}

@ApiTags("produtos")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiResponse({ type: ProductsResponse })
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
    return await this.productsService.findAll(page, perPage);
  }

  @Get("search/:productName")
  @ApiResponse({ type: [Product] })
  async search(@Param("productName") productName: string) {
    return await this.productsService.search(productName);
  }

  @Get(":id")
  @ApiResponse({
    type: Product,
  })
  async findById(@Param("id", new ParseIntPipe()) id: number) {
    return await this.productsService.findById(id);
  }

  @Post()
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiForbiddenResponse({ description: "Usuário não tem função." })
  @ApiUnauthorizedResponse({ description: "Sem autorização." })
  @ApiBadRequestResponse({ description: "Algum valor do corpo é inválido." })
  @ApiConflictResponse({ description: "Nome já cadastrado." })
  @ApiCreatedResponse({
    description: "Criado com sucesso!",
    type: Product,
  })
  async create(@Body() body: CreateProductDTO) {
    return await this.productsService.create(body);
  }

  @Post(":id/uploadImage")
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiCreatedResponse({
    description: "Upload feito com sucesso!",
  })
  @UseInterceptors(FileInterceptor("file"))
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  async uploadImage(
    @Param("id", new ParseIntPipe()) id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.productsService.uploadImage(id, file);
  }

  @Put(":id")
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: "Corpo invalido." })
  @ApiConflictResponse({ description: "Nome já cadastrado." })
  async update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() body: CreateProductDTO
  ) {
    return this.productsService.update(id, body);
  }

  @Delete("all")
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  async deleteAll() {
    return this.productsService.deleteAll();
  }

  @Delete(":id")
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  async delete(
    @Param("id", new ParseIntPipe()) id: number,
  ) {
    return this.productsService.delete(id);
  }
}
