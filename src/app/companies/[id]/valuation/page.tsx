'use client'

import { useParams, useSearchParams } from "next/navigation"
import DDMValuationComponent from "../../../../components/DDMValuationComponent"

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();

  return <DDMValuationComponent companyId={+params?.id || undefined} referenceReport={searchParams.get("refReport") || undefined} />
}

