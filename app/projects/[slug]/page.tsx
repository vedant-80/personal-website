import { ContentDetail } from "@/components/content/ContentDetail";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ContentDetail kind="project" slug={slug} />;
}
