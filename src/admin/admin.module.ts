import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { TokensModule } from '../tokens/tokens.module';

@Module({
  imports: [UsersModule, TokensModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
