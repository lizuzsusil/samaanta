import { notFound } from 'next/navigation'
import { can, requirePermission } from '@/lib/auth'
import { getGuide } from '@/lib/queries'
import { GuideView } from '@/components/guides/GuideView'

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requirePermission('guides', 'read')
  const { slug } = await params
  const [guide, canWrite] = await Promise.all([getGuide(slug), can(user.role, 'guides', 'write')])
  if (!guide) notFound()

  return <GuideView guide={guide} canWrite={canWrite} />
}
