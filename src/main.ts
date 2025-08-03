import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieparser from "cookie-parser";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
  const PORT = process.env.PORT ?? 3030;
  const app = await NestFactory.create(AppModule);

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  app.use(cookieparser());

  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3001",
      "https://admirelc.uz",
      "https://www.admirelc.uz",
      "https://admin.admirelc.uz",
    ],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  });

  await app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
  });
}
bootstrap();
