'use client'

import TimelineComponent from "../../../../components/TimelineComponent"

export default function Page({ params }: { params: { id: number } }) {
  return <TimelineComponent id={ params.id } />
}
