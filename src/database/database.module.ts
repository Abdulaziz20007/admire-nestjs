import { Module, Global } from "@nestjs/common";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../drizzle/schema";
import * as Database from "better-sqlite3";

@Global()
@Module({
  providers: [
    {
      provide: "DRIZZLE",
      useFactory: () => {
        const sqlite = new Database(process.env.DATABASE_URL!);
        return drizzle(sqlite, { schema });
      },
    },
  ],
  exports: ["DRIZZLE"],
})
export class DatabaseModule {}
