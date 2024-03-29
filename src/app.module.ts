import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { CartsModule } from "./carts/carts.module";
import { CategoriesModule } from "./categories/categories.module";
import { ProductsModule } from "./products/products.module";
import { UsersModule } from "./users/users.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    UsersModule,
    CartsModule,
    CategoriesModule,
    ServeStaticModule.forRoot({
      rootPath: `${process.cwd()}/public`,
    }),
    RolesModule,
  ],
})
export class AppModule {}
