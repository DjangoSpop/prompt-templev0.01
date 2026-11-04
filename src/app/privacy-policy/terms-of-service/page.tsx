import { redirect } from "next/navigation";

// Older links (sidebar, Chrome Web Store listing) point here; the current terms live at /terms.
export default function OldTermsRedirect() {
  redirect("/terms");
}
