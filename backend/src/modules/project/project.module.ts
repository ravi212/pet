import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectController } from './project.controller';

@Module({
  providers: [ProjectService],
  imports:[PrismaModule],
  controllers: [ProjectController]
})
export class ProjectModule {}
