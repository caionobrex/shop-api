import { IsInt, Min } from "class-validator";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request as ExpressRequest } from "express";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { CartsService } from "./carts.service";
import { Product } from "src/products/products.controller";

export class CreateItemDTO {
  @ApiProperty()
  productId: number;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CartItem {
  @ApiProperty()
  product: Product;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  subTotal: number;

  @ApiProperty()
  cartId: number;
}

@Controller("carts")
@ApiTags("carrinhos")
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async findCart(@Request() req: ExpressRequest & { user: any }) {
    return await this.cartsService.findCart(req.user.sub);
  }

  @Post("addItem")
  @ApiCreatedResponse({
    description: "Item adicionado ao carrinho com sucesso!",
    type: CartItem,
  })
  @ApiNotFoundResponse({ description: "Produto não encontrado." })
  @ApiBadRequestResponse({ description: "Quantidade inválida." })
  async addItem(
    @Request() req: ExpressRequest & { user: any },
    @Body() body: CreateItemDTO
  ) {
    return this.cartsService.addItem(
      body.productId,
      body.quantity,
      req.user.sub
    );
  }

  @Delete("deleteItem/:productId")
  @ApiResponse({ status: 200, description: "Item removido com sucesso!" })
  async deleteItem(
    @Request() req: ExpressRequest & { user: any },
    @Param("productId", new ParseIntPipe()) productId: number
  ) {
    return this.cartsService.deleteItem(req.user.sub, productId);
  }
}
