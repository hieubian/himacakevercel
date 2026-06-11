import CollectionPage from '../../components/CollectionPage';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <CollectionPage categorySlug={resolvedParams.slug} />;
}
