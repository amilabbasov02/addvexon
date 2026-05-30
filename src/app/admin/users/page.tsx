import { desc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { UsersAdminClient } from "./UsersAdminClient";

export const dynamic = "force-dynamic";

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  emailVerified: boolean;
  createdAt: Date;
};

export default async function AdminUsersPage() {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      plan: users.plan,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(500);
  return <UsersAdminClient users={rows} />;
}
