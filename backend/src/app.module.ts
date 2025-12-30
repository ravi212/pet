import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ProjectModule } from './modules/project/project.module';
import { CategoryModule } from './modules/category/category.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { TaskModule } from './modules/task/task.module';
import { CycleModule } from './modules/cycle/cycle.module';
import { ReceiptModule } from './modules/receipt/receipt.module';
@Module({
  imports: [PrismaModule, AuthModule, UserModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    ProjectModule,
    CategoryModule,
    ExpenseModule,
    TaskModule,
    CycleModule,
    ReceiptModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
