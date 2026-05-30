import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { getSession } from "@/lib/session";

const NAV = [
  { href: "/admin", label: "Overview", icon: "dashboard" },
  { href: "/admin/listings", label: "Listings", icon: "storefront" },
  { href: "/admin/campaigns", label: "Campaigns", icon: "campaign" },
  { href: "/admin/payments", label: "Payments", icon: "payments" },
  { href: "/admin/visitors", label: "Visitors", icon: "monitoring" },
  { href: "/admin/waitlist", label: "Waitlist", icon: "groups" },
  { href: "/admin/users", label: "Users", icon: "person" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();
  if (!admin) {
    // Distinguish "not signed in" from "signed in as non-admin". The
    // former gets bounced to /signin; the latter sees a clear 403 so they
    // know to switch accounts instead of looping through sign-in.
    const session = await getSession();
    if (!session?.user) {
      redirect("/signin?next=/admin");
    }
    return (
      <main className="pt-24 pb-16 px-4 flex items-center justify-center min-h-[70vh]">
        <div className="glass-panel rounded-3xl p-10 max-w-md text-center border border-error/30">
          <div className="w-14 h-14 rounded-2xl bg-error-container/40 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-error text-2xl">
              lock
            </span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
            Admin access only
          </h1>
          <p className="text-on-surface-variant text-body-md font-body-md mb-5">
            You&apos;re signed in as{" "}
            <code className="bg-surface-container-high/60 px-1.5 py-0.5 rounded text-on-surface">
              {session.user.email}
            </code>{" "}
            — this account isn&apos;t in the admin allowlist. Sign in with
            the admin email or contact the workspace owner.
          </p>
          <div className="flex items-center gap-3 justify-center">
            <Link
              href="/dashboard"
              className="glass-panel px-5 py-2.5 rounded-full text-label-md font-label-md text-on-surface-variant hover:text-on-surface"
            >
              Back to dashboard
            </Link>
            <Link
              href="/signin?next=/admin"
              className="ai-gradient text-on-primary px-5 py-2.5 rounded-full text-label-md font-label-md"
            >
              Switch account
            </Link>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl ai-gradient flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary">
              admin_panel_settings
            </span>
          </div>
          <div>
            <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim">
              Addvoxen control center
            </p>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Admin
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="glass-panel rounded-full px-4 py-2 flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </div>

        {children}
      </div>
    </main>
  );
}
