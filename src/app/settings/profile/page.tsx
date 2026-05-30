import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { users, userProfiles } from "@/db/schema";
import { ProfileForm } from "./ProfileForm";
import { ProfileSettingsHeader } from "./ProfileSettingsHeader";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/signin?next=/settings/profile");
  const rows = await db
    .select({
      name: users.name,
      handle: userProfiles.handle,
      bio: userProfiles.bio,
      website: userProfiles.website,
      twitter: userProfiles.twitter,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(users.id, session.user.id))
    .limit(1);
  const initial = rows[0] ?? {};
  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16">
      <div className="w-full max-w-xl mx-auto">
        <ProfileSettingsHeader
          handle={initial.handle ?? session.user.id}
        />
        <ProfileForm
          initial={{
            name: initial.name ?? "",
            handle: initial.handle ?? "",
            bio: initial.bio ?? "",
            website: initial.website ?? "",
            twitter: initial.twitter ?? "",
          }}
          ownerId={session.user.id}
        />
      </div>
    </main>
  );
}
