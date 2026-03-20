import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

let _instance: DbInstance | null = null;

function getInstance(): DbInstance {
  if (!_instance) {
    _instance = drizzle(neon(process.env.DATABASE_URL!), { schema });
  }
  return _instance;
}

// Proxy defers neon() until the first actual DB call (request time, not build time)
export const db = new Proxy({} as DbInstance, {
  get(_, prop: string | symbol) {
    const inst = getInstance();
    const val = (inst as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? (val as Function).bind(inst) : val;
  },
});
