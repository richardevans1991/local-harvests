import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout, { LegalSection } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — Local Harvest",
  description:
    "How Local Harvest collects, uses, and protects your personal data under UK GDPR.",
};

const LAST_UPDATED = "30 June 2026";
const CONTACT_EMAIL = "hello@local-harvests.co.uk";

export default function PrivacyPage() {
  return (
    <LegalPageLayout badge="Legal" title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p className="rounded-xl border border-harvest-tan/50 bg-white/80 px-4 py-3 text-sm leading-relaxed">
        This policy explains how Local Harvest (&ldquo;we&rdquo;, &ldquo;us&rdquo;) handles personal
        data when you use{" "}
        <a href="https://www.local-harvests.co.uk" className="text-harvest-green hover:underline">
          local-harvests.co.uk
        </a>
        . It is written for UK users and reflects UK GDPR and the Data Protection Act 2018.
      </p>

      <LegalSection title="Who we are">
        <p>
          Local Harvest is an online marketplace that connects customers with independent UK farm
          shops. For data protection questions, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-harvest-green hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="What data we collect">
        <p>Depending on how you use the site, we may process:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Account details</strong> — name, email address, and a securely hashed password
            when you register as a customer or farmer.
          </li>
          <li>
            <strong>Order information</strong> — contact name, email, phone number, pickup or
            delivery preferences, delivery address (if applicable), order notes, and what you bought.
          </li>
          <li>
            <strong>Farm shop listings</strong> — farm name, location, descriptions, product
            details, prices, and photos you upload as a farmer.
          </li>
          <li>
            <strong>Payment references</strong> — Stripe transaction and subscription IDs. We do not
            store your full card number.
          </li>
          <li>
            <strong>Session data</strong> — a cookie named <code>local-harvest-session</code> so you
            can stay signed in.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="How we use your data">
        <p>We use personal data to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Run your account and keep you signed in.</li>
          <li>Process orders and show order history.</li>
          <li>Pass order contact details to the relevant farm shop so they can fulfil your order.</li>
          <li>Send service emails (for example order confirmations) via our email provider.</li>
          <li>Manage farmer subscriptions, free trials, and platform fees.</li>
          <li>Keep the platform secure and fix problems.</li>
        </ul>
        <p>
          Our legal bases include performing our contract with you, legitimate interests in running
          a safe marketplace, and — where required — your consent.
        </p>
      </LegalSection>

      <LegalSection title="Who we share data with">
        <p>We share data only where needed to provide the service:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Farm shops</strong> — when you place an order, the selling farmer receives your
            name, email, phone, and fulfilment details so they can prepare and hand over your order.
          </li>
          <li>
            <strong>Stripe</strong> — processes customer checkout payments and farmer subscription
            billing. Stripe&apos;s privacy policy applies to payment data they handle.
          </li>
          <li>
            <strong>Resend</strong> — sends transactional emails on our behalf.
          </li>
          <li>
            <strong>Railway</strong> — hosts our application and database.
          </li>
        </ul>
        <p>We do not sell your personal data.</p>
      </LegalSection>

      <LegalSection title="How long we keep data">
        <p>
          We keep account and order data for as long as your account is active and for a reasonable
          period afterwards for support, accounting, and legal obligations. You can ask us to delete
          your account — see Your rights below.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>Under UK data protection law you can:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Ask for a copy of your personal data.</li>
          <li>Ask us to correct inaccurate data.</li>
          <li>Ask us to delete your data in certain circumstances.</li>
          <li>Object to or restrict some processing.</li>
          <li>Request data portability where it applies.</li>
        </ul>
        <p>
          Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-harvest-green hover:underline">
            {CONTACT_EMAIL}
          </a>{" "}
          to exercise these rights. You can also complain to the UK Information Commissioner&apos;s
          Office (ICO) at{" "}
          <a
            href="https://ico.org.uk/make-a-complaint/"
            className="text-harvest-green hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            ico.org.uk
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          We use industry-standard measures including HTTPS, hashed passwords, and access controls.
          No online service is completely risk-free; please use a strong, unique password.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top
          will change when we do. Significant changes may also be highlighted on the site.
        </p>
        <p>
          See also our{" "}
          <Link href="/terms" className="text-harvest-green hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}