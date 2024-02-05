import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiProperty,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";
import { Request as ExpressHeader } from "express";
import { AuthService } from "./auth.service";
import { RefreshTokenGuard } from "./guards/refreshToken.guard";

export class RegisterDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

class LoginDTO {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

class LoginResponse {
  @ApiProperty()
  token: string;
}

class RegisterResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

@ApiTags("autenticação")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("refreshToken")
  @ApiBearerAuth('refreshToken')
  @UseGuards(RefreshTokenGuard)
  @ApiHeader({ name: 'Authorization', description: 'Valor da refresh token' })
  refreshToken(@Request() req: ExpressHeader & { user: any }) {
    return this.authService.refreshToken(req.user);
  }

  @Post("register")
  @ApiCreatedResponse({
    type: RegisterResponse,
  })
  @ApiConflictResponse({
    description: "Email já cadastrado.",
  })
  register(@Body() body: RegisterDTO) {
    return this.authService.register(body);
  }

  @ApiResponse({
    status: 200,
    type: LoginResponse,
  })
  @Post("login")
  login(@Body() body: LoginDTO) {
    return this.authService.login(body.email, body.password);
  }
}
