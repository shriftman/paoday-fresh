'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import PipelineColumn from './PipelineColumn';
import DealCard from './DealCard';
import { createClient } from '@/lib/supabase/client';

interface Deal {
  id: string;
  company_name: string;
  stage: string;
  owner: string | null;
  last_contact: string | null;
  notes: string | null;
  amount: number | null;
  contact_person: string | null;
  contact_email: string | null;
  position: number;
}

const stages = [
  { id: 'pipeline', title: 'Pipeline', color: '#3B82F6' },
  { id: 'active', title: 'Active', color: '#10B981' },
  { id: 'passed', title: 'Passed', color: '#6B7280' },
  { id: 'invested', title: 'Invested', color: '#8B5CF6' },
];

export default function CRMBoard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const supabase = createClient();

  useEffect(() => {
    fetchDeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeDeal = deals.find((d) => d.id === activeId);
    const overDeal = deals.find((d) => d.id === overId);

    if (!activeDeal) return;

    // Check if dragging over a column
    const overStage = stages.find((s) => s.id === overId);
    
    if (overStage && activeDeal.stage !== overStage.id) {
      // Moving to a different column
      setDeals((deals) => {
        const updatedDeals = deals.map((deal) =>
          deal.id === activeId
            ? { ...deal, stage: overStage.id }
            : deal
        );
        return updatedDeals;
      });
    } else if (overDeal && activeDeal.stage === overDeal.stage) {
      // Reordering within the same column
      const activeIndex = deals.findIndex((d) => d.id === activeId);
      const overIndex = deals.findIndex((d) => d.id === overId);

      if (activeIndex !== overIndex) {
        setDeals((deals) => arrayMove(deals, activeIndex, overIndex));
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;

    const activeDeal = deals.find((d) => d.id === activeId);
    if (!activeDeal) return;

    // Update in database
    try {
      const { error } = await supabase
        .from('deals')
        .update({ stage: activeDeal.stage })
        .eq('id', activeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating deal:', error);
      // Revert on error
      fetchDeals();
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">CRM Pipeline</h1>
        <p className="text-gray-600">
          Drag and drop deals between stages to update their status
        </p>
      </div>

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              deals={deals.filter((deal) => deal.stage === stage.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? (
            <div className="rotate-3 scale-105">
              <DealCard deal={activeDeal} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
