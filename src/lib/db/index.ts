import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

let _instance: DbInstance | null = null;

function getInstance(): DbInstance {
  if (!_instance) {
    const client = postgres(process.env.DATABASE_URL!);
    _instance = drizzle(client, { schema });
  }
  return _instance;
}

export const db = new Proxy({} as DbInstance, {
  get(_, prop: string | symbol) {
    const inst = getInstance();
    const val = (inst as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? (val as Function).bind(inst) : val;
  },
});
