import { Module } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module";
import { WebModule } from "./web/web.module";
import { TeacherModule } from "./teacher/teacher.module";
import { StudentModule } from "./student/student.module";
import { MediaModule } from "./media/media.module";
import { PhoneModule } from "./phone/phone.module";
import { WebPhoneModule } from "./web-phone/web-phone.module";
import { WebMediaModule } from "./web-media/web-media.module";
import { WebStudentModule } from "./web-student/web-student.module";
import { WebTeacherModule } from "./web-teacher/web-teacher.module";
import { IconModule } from "./icon/icon.module";
import { SocialModule } from "./social/social.module";
import { WebSocialModule } from "./web-social/web-social.module";
import { MessageModule } from "./message/message.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { AccessTokenGuard } from "./common/guards";
import { JwtModule } from "@nestjs/jwt";
import { CloudflareModule } from "./cloudflare/cloudflare.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AdminModule,
    WebModule,
    TeacherModule,
    StudentModule,
    MediaModule,
    PhoneModule,
    WebPhoneModule,
    WebMediaModule,
    WebStudentModule,
    WebTeacherModule,
    IconModule,
    SocialModule,
    WebSocialModule,
    MessageModule,
    AuthModule,
    JwtModule.register({}),
    CloudflareModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
