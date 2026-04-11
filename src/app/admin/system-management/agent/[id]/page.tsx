import React from 'react';
import AgentDetailView from './AgentDetailView';

export default async function AgentDynamicPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return <AgentDetailView agentId={resolvedParams.id} />;
}