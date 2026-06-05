import { getTableColumns } from "drizzle-orm";
import { providers } from "@/lib/db/schema";

/** Provider columns for API/UI (excludes password_hash). */
const cols = getTableColumns(providers);
const { passwordHash: _passwordHash, ...providerFields } = cols;

export { providerFields };
