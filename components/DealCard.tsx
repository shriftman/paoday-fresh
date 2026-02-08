'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Building2, User, Calendar, DollarSign, MoreVertical } from 'lucide-react';

interface Deal {
  id: string;
  company_name: string;
  owner: string | null;
  last_contact: string | null;
  notes: string | null;
  amount: number | null;
  contact_person: string | null;
  contact_email: string | null;
}

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No contact';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-move p-4 mb-3 border border-gray-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            {deal.company_name}
          </h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Amount */}
      {deal.amount && (
        <div className="flex items-center space-x-2 mb-2 text-green-600 font-semibold">
          <DollarSign className="w-4 h-4" />
          <span className="text-sm">{formatAmount(deal.amount)}</span>
        </div>
      )}

      {/* Owner */}
      {deal.owner && (
        <div className="flex items-center space-x-2 mb-2 text-gray-600">
          <User className="w-3.5 h-3.5" />
          <span className="text-xs">{deal.owner}</span>
        </div>
      )}

      {/* Last Contact */}
      <div className="flex items-center space-x-2 mb-3 text-gray-500">
        <Calendar className="w-3.5 h-3.5" />
        <span className="text-xs">{formatDate(deal.last_contact)}</span>
      </div>

      {/* Notes Preview */}
      {deal.notes && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-600 line-clamp-2">
            {deal.notes}
          </p>
        </div>
      )}

      {/* Contact Person */}
      {deal.contact_person && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Contact:</span>
            <span className="text-xs font-medium text-gray-700">
              {deal.contact_person}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
