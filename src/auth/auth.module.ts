import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { PrismaService } from "src/prisma.service";

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      global: true,
      secret: "cat123",
      signOptions: { expiresIn: "4h" },
    }),
  ],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
