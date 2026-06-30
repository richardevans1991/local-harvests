import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout, { LegalSection } from "@/components/LegalPageLayout";
import { COMMISSION_RATE, FARMER_PLAN_LIST, TRIAL_DAYS } from "@/lib/farmer-plans";

export const metadata: Metadata = {
  title: "Terms of Service — Local Harvest",
  description:
    "Terms for using Local Harvest as a customer or farm shop seller on our UK marketplace.",
};

const LAST_UPDATED = "30 June 2026";
const CONTACT_EMAIL = "hello@local-harvests.co.uk";
const COMMISSION_PERCENT = Math.round(COMMISSION_RATE * 100);
const PLAN_PRICES = FARMER_PLAN_LIST.map((plan) => `${plan.name} (${plan.priceDisplay}/month)`).join(
  ", "
);

export default function TermsPage() {
  return (
    <LegalPageLayout badge="Legal" title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <p className="rounded-xl border border-harvest-tan/50 bg-white/80 px-4 py-3 text-sm leading-relaxed">
        These terms govern your use of Local Harvest at{" "}
        <a href="https://www.local-harvests.co.uk" className="text-harvest-green hover:underline">
          local-harvests.co.uk
        </a>
        . By using the site you agree to them. If you do not agree, please do not use the service.
      </p>

      <LegalSection title="About Local Harvest">
        <p>
          Local Harvest is a marketplace platform. We provide the website, ordering tools, and payment
          infrastructure. We are not the seller of farm produce — each listed farm shop is an
          independent seller responsible for its own products, pricing, and fulfilment.
        </p>
      </LegalSection>

      <LegalSection title="Customer orders">
        <p>
          When you buy from a farm shop on Local Harvest, your contract for the goods is with that
          farm shop, not with Local Harvest. You must provide accurate contact and fulfilment
          details.
        </p>
        <p>
          Payment is handled by Stripe where enabled. Some farms may also accept payment on pickup
          or delivery when Stripe is not in use. Refunds, substitutions, and product quality
          issues should be raised with the farm shop in the first instance; we can help facilitate
          contact where needed.
        </p>
        <p>
          A farm may set its shop to &ldquo;closed&rdquo; so you can browse listings but cannot
          place orders until they reopen.
        </p>
      </LegalSection>

      <LegalSection title="Farmer accounts and subscriptions">
        <p>
          Farmers can register for a {TRIAL_DAYS}-day free trial with no payment card required at
          signup. After the trial, you must set up monthly billing via Stripe to keep managing your
          shop. Current plans are: {PLAN_PRICES}.
        </p>
        <p>
          From month two onwards (after your free trial), Local Harvest charges a{" "}
          {COMMISSION_PERCENT}% commission on customer order subtotals sold through the platform. No
          commission applies during the free trial period.
        </p>
        <p>
          You are responsible for accurate listings, stock availability, allergen information where
          required, food safety, and any licences or registrations needed to sell your products.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use the service for anything unlawful or misleading.</li>
          <li>Upload content you do not have rights to, or that is offensive or harmful.</li>
          <li>Attempt to disrupt, scrape, or gain unauthorised access to the platform.</li>
          <li>Misrepresent your farm, products, or location.</li>
        </ul>
        <p>
          We may suspend or remove accounts that breach these terms or harm other users.
        </p>
      </LegalSection>

      <LegalSection title="Platform availability">
        <p>
          We aim to keep Local Harvest available and secure, but we do not guarantee uninterrupted
          access. We may update, suspend, or withdraw features for maintenance, legal, or business
          reasons.
        </p>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>
          Local Harvest branding, software, and site design belong to us. Farmers retain ownership of
          their own photos and product descriptions, and grant us a licence to display them on the
          platform while their shop is listed.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, Local Harvest is not liable for the quality,
          safety, or legality of goods sold by farm shops, nor for losses arising from fulfilment
          delays, farm shop actions, or third-party services such as Stripe.
        </p>
        <p>
          Nothing in these terms excludes liability that cannot be excluded under UK law (including
          for death or personal injury caused by negligence, or fraud).
        </p>
      </LegalSection>

      <LegalSection title="Ending your account">
        <p>
          You may stop using the service at any time. Farmers can cancel subscription billing
          through Stripe. We may terminate accounts that violate these terms. Order records may be
          retained as described in our{" "}
          <Link href="/privacy" className="text-harvest-green hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms. Continued use after changes are posted means you accept the
          updated terms. Material changes will be reflected in the &ldquo;Last updated&rdquo; date.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These terms are governed by the laws of England and Wales. Disputes are subject to the
          exclusive jurisdiction of the courts of England and Wales, without prejudice to mandatory
          consumer rights in your home country if you are a consumer resident elsewhere in the UK.
        </p>
        <p>
          Questions? Contact{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-harvest-green hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}