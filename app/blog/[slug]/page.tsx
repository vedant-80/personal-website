import { ContentDetail } from "@/components/content/ContentDetail";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ContentDetail kind="blog" slug={slug} />;
}
