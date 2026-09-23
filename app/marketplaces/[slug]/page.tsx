import { redirect } from "next/navigation";

/** Deep marketplace links open the products catalog filtered to that marketplace. */
export default async function MarketplaceSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const map: Record<string, string> = {
    aws: "mp-aws",
    azure: "mp-azure",
    gcp: "mp-gcp",
    databricks: "mp-databricks",
    anthropic: "mp-anthropic",
  };
  const id = map[slug];
  redirect(id ? `/products?marketplace=${id}` : "/marketplaces");
}
