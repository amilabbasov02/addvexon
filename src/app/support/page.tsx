import { SupportForm } from "./SupportForm";
import { SupportHeader } from "./SupportHeader";

export const metadata = {
  title: "Support — Addvoxen",
  description: "Reach the Addvoxen team — bug reports, billing questions and partnerships.",
};

export default function SupportPage() {
  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16">
      <div className="w-full max-w-2xl mx-auto">
        <SupportHeader />
        <SupportForm />
      </div>
    </main>
  );
}
