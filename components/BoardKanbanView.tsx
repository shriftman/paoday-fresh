'use client';

import React, { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { BoardData, BoardRowWithCells, BoardColumn, getCellDisplayValue, StatusCellValue, PersonCellValue } from '@/lib/types/board';
import { Plus, MoreVertical } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface BoardKanbanViewProps {
  boardData: BoardData;
  rows: BoardRowWithCells[];
  groupByColumnId?: string;
  onCellUpdate: (rowId: string, columnId: string, value: Partial<any>) => Promise<void>;
  onRowClick: (rowId: string) => void;
}

export default function BoardKanbanView({
  boardData,
  rows,
  groupByColumnId,
  onCellUpdate,
  onRowClick,
}: BoardKanbanViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get the grouping column (default to status column if not specified)
  const groupingColumn = useMemo(() => {
    if (groupByColumnId) {
      return boardData.columns.find(c => c.id === groupByColumnId);
    }
    // Default to first status column
    return boardData.columns.find(c => c.column_type === 'status');
  }, [boardData.columns, groupByColumnId]);

  // Group rows by the grouping column
  const groups = useMemo(() => {
    if (!groupingColumn) {
      return [{ id: 'all', label: 'All Items', rows }];
    }

    if (groupingColumn.column_type === 'status') {
      const settings = groupingColumn.settings as { labels?: Array<{ id: string; label: string; color: string }> };
      const labels = settings.labels || [];

      return labels.map(label => {
        const groupRows = rows.filter(row => {
          const cell = row.cells.get(groupingColumn.id);
          const statusValue = cell?.value_json as StatusCellValue | undefined;
          return statusValue?.status_id === label.id;
        });

        return {
          id: label.id,
          label: label.label,
          color: label.color,
          rows: groupRows,
        };
      });
    }

    // For other column types, create groups dynamically
    const groupMap = new Map<string, BoardRowWithCells[]>();
    
    rows.forEach(row => {
      const cell = row.cells.get(groupingColumn.id);
      let groupKey = '_empty';
      let groupLabel = '(No value)';

      if (cell) {
        if (groupingColumn.column_type === 'person') {
          const personValue = cell.value_json as PersonCellValue | undefined;
          groupKey = personValue?.name || '_empty';
          groupLabel = personValue?.name || '(No value)';
        } else if (groupingColumn.column_type === 'text') {
          groupKey = cell.value_text || '_empty';
          groupLabel = cell.value_text || '(No value)';
        }
      }

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, []);
      }
      groupMap.get(groupKey)!.push(row);
    });

    return Array.from(groupMap.entries()).map(([key, groupRows]) => ({
      id: key,
      label: key === '_empty' ? '(No value)' : key,
      rows: groupRows,
    }));
  }, [groupingColumn, rows]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !groupingColumn) return;

    const rowId = active.id as string;
    const targetGroupId = over.id as string;

    // Update the cell value based on the grouping column type
    if (groupingColumn.column_type === 'status') {
      const settings = groupingColumn.settings as { labels?: Array<{ id: string; label: string; color: string }> };
      const targetLabel = settings.labels?.find(l => l.id === targetGroupId);
      
      if (targetLabel) {
        await onCellUpdate(rowId, groupingColumn.id, {
          value_json: {
            status_id: targetLabel.id,
            label: targetLabel.label,
            color: targetLabel.color,
          },
        });
      }
    } else if (groupingColumn.column_type === 'text') {
      await onCellUpdate(rowId, groupingColumn.id, {
        value_text: targetGroupId === '_empty' ? '' : targetGroupId,
      });
    }
  };

  const renderCard = (row: BoardRowWithCells, isDragging = false) => {
    // Get primary column value for title
    const primaryColumn = boardData.columns.find(c => c.is_primary) || boardData.columns[0];
    const titleCell = primaryColumn ? row.cells.get(primaryColumn.id) : undefined;
    const title = titleCell ? getCellDisplayValue(titleCell, primaryColumn) : 'Untitled';

    // Get other important columns to display
    const displayColumns = boardData.columns.filter(c => 
      c.id !== groupingColumn?.id && 
      c.id !== primaryColumn?.id &&
      ['person', 'date', 'number'].includes(c.column_type)
    ).slice(0, 3);

    return (
      <div
        className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
          isDragging ? 'opacity-50 border-blue-500' : 'border-gray-200'
        }`}
        onClick={() => !isDragging && onRowClick(row.id)}
      >
        <div className="p-3">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>

          {/* Additional fields */}
          <div className="space-y-2">
            {displayColumns.map(column => {
              const cell = row.cells.get(column.id);
              if (!cell) return null;

              const displayValue = getCellDisplayValue(cell, column);
              if (!displayValue) return null;

              return (
                <div key={column.id} className="text-sm">
                  <span className="text-gray-500">{column.name}: </span>
                  {column.column_type === 'person' ? (
                    <div className="inline-flex items-center gap-1 mt-1">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-semibold">
                        {displayValue.charAt(0)}
                      </div>
                      <span className="text-gray-900">{displayValue}</span>
                    </div>
                  ) : column.column_type === 'number' ? (
                    <span className="font-medium text-gray-900">{displayValue}</span>
                  ) : (
                    <span className="text-gray-700">{displayValue}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const activeRow = activeId ? rows.find(r => r.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full p-6 overflow-x-auto">
        <div className="flex gap-6 h-full min-w-max">
          {groups.map((group) => (
            <div
              key={group.id}
              className="flex-shrink-0 w-80 flex flex-col"
            >
              {/* Column header */}
              <div
                className="flex items-center justify-between mb-4 pb-3 border-b-2"
                style={{ borderColor: (group as any).color || '#E5E7EB' }}
              >
                <div className="flex items-center gap-2">
                  {(group as any).color && (
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: (group as any).color }}
                    ></span>
                  )}
                  <h2 className="font-semibold text-gray-900">{group.label}</h2>
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {group.rows.length}
                  </span>
                </div>
                
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Drop zone */}
              <div
                id={group.id}
                className="flex-1 space-y-3 overflow-y-auto pb-4"
              >
                {group.rows.map((row) => (
                  <div
                    key={row.id}
                    id={row.id}
                    className="cursor-move"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', row.id);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const draggedRowId = e.dataTransfer.getData('text/plain');
                      
                      if (draggedRowId && draggedRowId !== row.id && groupingColumn) {
                        // Update the dropped card's status/group
                        if (groupingColumn.column_type === 'status') {
                          const settings = groupingColumn.settings as { labels?: Array<{ id: string; label: string; color: string }> };
                          const targetLabel = settings.labels?.find(l => l.id === group.id);
                          
                          if (targetLabel) {
                            await onCellUpdate(draggedRowId, groupingColumn.id, {
                              value_json: {
                                status_id: targetLabel.id,
                                label: targetLabel.label,
                                color: targetLabel.color,
                              },
                            });
                          }
                        }
                      }
                    }}
                  >
                    {renderCard(row, activeId === row.id)}
                  </div>
                ))}

                {/* Empty state */}
                {group.rows.length === 0 && (
                  <div
                    className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg text-gray-400"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const draggedRowId = e.dataTransfer.getData('text/plain');
                      
                      if (draggedRowId && groupingColumn) {
                        if (groupingColumn.column_type === 'status') {
                          const settings = groupingColumn.settings as { labels?: Array<{ id: string; label: string; color: string }> };
                          const targetLabel = settings.labels?.find(l => l.id === group.id);
                          
                          if (targetLabel) {
                            await onCellUpdate(draggedRowId, groupingColumn.id, {
                              value_json: {
                                status_id: targetLabel.id,
                                label: targetLabel.label,
                                color: targetLabel.color,
                              },
                            });
                          }
                        }
                      }
                    }}
                  >
                    Drop here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeRow && (
          <div className="w-80">
            {renderCard(activeRow, true)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
