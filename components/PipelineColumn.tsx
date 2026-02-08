'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import DealCard from './DealCard';
import { Plus } from 'lucide-react';

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
}

interface PipelineColumnProps {
  stage: {
    id: string;
    title: string;
    color: string;
  };
  deals: Deal[];
}

const stageColors: Record<string, { bg: string; text: string; border: string }> = {
  pipeline: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  active: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  passed: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
  invested: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
};

export default function PipelineColumn({ stage, deals }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const colors = stageColors[stage.id] || stageColors.pipeline;
  const dealCount = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);

  const formatTotalValue = (amount: number) => {
    if (amount === 0) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount);
  };

  return (
    <div className="flex-1 min-w-[320px] flex flex-col">
      {/* Column Header */}
      <div className={`${colors.bg} ${colors.border} border-2 rounded-t-lg p-4`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className={`font-bold text-lg ${colors.text}`}>
            {stage.title}
          </h2>
          <button
            className={`${colors.text} hover:opacity-70 transition-opacity`}
            title="Add new deal"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className={`${colors.text} font-medium`}>
            {dealCount} {dealCount === 1 ? 'deal' : 'deals'}
          </span>
          {totalValue > 0 && (
            <span className={`${colors.text} font-semibold`}>
              {formatTotalValue(totalValue)}
            </span>
          )}
        </div>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 bg-gray-50 rounded-b-lg p-4 min-h-[500px] transition-colors ${
          isOver ? 'bg-blue-100 border-2 border-blue-400 border-dashed' : 'border-2 border-gray-200'
        }`}
      >
        <SortableContext
          items={deals.map((deal) => deal.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              Drop deals here
            </div>
          ) : (
            <div className="space-y-3">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
