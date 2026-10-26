import { redirect } from "next/navigation";

// The sign-in page links to /privacy; the policy lives at /privacy-policy.
export default function PrivacyRedirect() {
  redirect("/privacy-policy");
}
