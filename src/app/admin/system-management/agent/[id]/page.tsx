'use client';

import React from 'react';
import AgentDetailView from './AgentDetailView';

export default function AgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  return <AgentDetailView agentId={id} />;
}
