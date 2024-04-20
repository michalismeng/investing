"use client";

import { useParams } from "next/navigation";
import DDMValuationComponent from "../../../../components/DDMValuationComponent";

export default function Page() {
  const params = useParams();

  return <DDMValuationComponent companyId={+params?.id || undefined} />;
}
