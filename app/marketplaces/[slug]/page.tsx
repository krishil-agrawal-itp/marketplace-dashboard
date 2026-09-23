import { redirect } from "next/navigation";

export default function MarketplaceRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Keep slug available for future deep-links; funnel into products section.
  void params;
  redirect("/#marketplaces");
}
