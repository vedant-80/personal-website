import { ContentListing } from "@/components/content/ContentListing";

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  const activeSlugs = topic ? topic.split(",").map((slug) => slug.trim()).filter(Boolean) : [];
  return <ContentListing kind="blog" activeSlugs={activeSlugs} />;
}
