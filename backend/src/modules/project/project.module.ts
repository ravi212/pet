import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [ProjectService],
  imports:[PrismaModule]
})
export class ProjectModule {}
