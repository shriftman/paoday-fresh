'use client';

import React from 'react';
import { BoardColumn, BoardFilter, FilterOperator } from '@/lib/types/board';
import { Plus, X } from 'lucide-react';

interface BoardFiltersBarProps {
  columns: BoardColumn[];
  filters: BoardFilter[];
  onFiltersChange: (filters: BoardFilter[]) => void;
}

const OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'is_any_of', label: 'Is any of' },
];

export default function BoardFiltersBar({
  columns,
  filters,
  onFiltersChange,
}: BoardFiltersBarProps) {
  const handleAddFilter = () => {
    const newFilter: BoardFilter = {
      id: `filter_${Date.now()}`,
      column_id: columns[0]?.id || '',
      operator: 'equals',
      value: '',
    };
    onFiltersChange([...filters, newFilter]);
  };

  const handleRemoveFilter = (filterId: string) => {
    onFiltersChange(filters.filter(f => f.id !== filterId));
  };

  const handleUpdateFilter = (
    filterId: string,
    updates: Partial<BoardFilter>
  ) => {
    onFiltersChange(
      filters.map(f => (f.id === filterId ? { ...f, ...updates } : f))
    );
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
        <button
          onClick={handleAddFilter}
          className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add filter
        </button>
      </div>

      {filters.length === 0 ? (
        <p className="text-sm text-gray-500">No filters applied</p>
      ) : (
        <div className="space-y-2">
          {filters.map((filter, index) => {
            const column = columns.find(c => c.id === filter.column_id);
            
            return (
              <div
                key={filter.id}
                className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200"
              >
                {/* Column selector */}
                <select
                  value={filter.column_id}
                  onChange={(e) =>
                    handleUpdateFilter(filter.id, { column_id: e.target.value })
                  }
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {columns.map(col => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>

                {/* Operator selector */}
                <select
                  value={filter.operator}
                  onChange={(e) =>
                    handleUpdateFilter(filter.id, {
                      operator: e.target.value as FilterOperator,
                    })
                  }
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>

                {/* Value input (hide for is_empty/is_not_empty) */}
                {!['is_empty', 'is_not_empty'].includes(filter.operator) && (
                  <>
                    {column?.column_type === 'status' ? (
                      <select
                        value={filter.value as string}
                        onChange={(e) =>
                          handleUpdateFilter(filter.id, { value: e.target.value })
                        }
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select status...</option>
                        {((column.settings as any).labels || []).map((label: any) => (
                          <option key={label.id} value={label.id}>
                            {label.label}
                          </option>
                        ))}
                      </select>
                    ) : column?.column_type === 'number' ? (
                      <input
                        type="number"
                        value={filter.value as string}
                        onChange={(e) =>
                          handleUpdateFilter(filter.id, { value: e.target.value })
                        }
                        placeholder="Value..."
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : column?.column_type === 'date' ? (
                      <input
                        type="date"
                        value={filter.value as string}
                        onChange={(e) =>
                          handleUpdateFilter(filter.id, { value: e.target.value })
                        }
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={filter.value as string}
                        onChange={(e) =>
                          handleUpdateFilter(filter.id, { value: e.target.value })
                        }
                        placeholder="Value..."
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </>
                )}

                {/* Remove button */}
                <button
                  onClick={() => handleRemoveFilter(filter.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {filters.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <span>Showing items that match</span>
          <select className="px-2 py-1 border border-gray-300 rounded">
            <option value="all">all</option>
            <option value="any">any</option>
          </select>
          <span>of these filters</span>
        </div>
      )}
    </div>
  );
}
