import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma.service";
import { RegisterDTO } from "./auth.controller";
import { genSaltSync, hashSync, compareSync } from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async refreshToken(payload) {
    payload = { sub: payload.sub, username: payload.username, role: payload.role }
    const newToken = await this.jwtService.signAsync(payload);
    const newRefreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: "1d",
      secret: "dog321",
    });
    return { token: newToken, refreshToken: newRefreshToken };
  }

  async register(data: RegisterDTO) {
    let user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (user) {
      throw new ConflictException();
    }
    const salt = genSaltSync();
    const hash = hashSync(data.password, salt);
    user = await this.prisma.user.create({
      data: {
        ...data,
        role: { connect: { id: 1 } },
        salt,
        password: hash,
      },
    });
    await this.prisma.cart.create({
      data: { userId: user.id },
    });
    delete user.password;
    delete user.salt;
    return user;
  }

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user || !compareSync(pass, user.password)) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.name, role: user.role.name };
    const token = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: "1d",
      secret: "dog321",
    });
    return { token, refreshToken };
  }
}
