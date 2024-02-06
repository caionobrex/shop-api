import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = this.extractRefreshTokenFromHeader(request);
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    try {
      const user = await this.prisma.user.findFirst({ where: { refreshToken } })
      if (!user) {
        throw new UnauthorizedException();
      }
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: "dog321",
      });
      request["user"] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractRefreshTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
