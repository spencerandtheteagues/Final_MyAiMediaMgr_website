import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { ContentModule } from './content/content.module';

@Module({
  imports: [AuthModule, AiModule, ContentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
