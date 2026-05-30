import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { users, userProfiles } from "@/db/schema";
import { ProfileForm } from "./ProfileForm";

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
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          Edit profile
        </h1>
        <p className="text-on-surface-variant text-body-md font-body-md mb-8">
          Your public profile lives at{" "}
          <code className="bg-surface-container-high/50 px-1.5 py-0.5 rounded text-on-surface">
            /u/{initial.handle ?? session.user.id}
          </code>
          .
        </p>
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
