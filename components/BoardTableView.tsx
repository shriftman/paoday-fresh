'use client';

import React, { useState } from 'react';
import { BoardData, BoardRowWithCells, BoardGroup, BoardColumn, BoardCell as BoardCellType } from '@/lib/types/board';
import { ChevronDown, ChevronRight, Trash2, GripVertical } from 'lucide-react';
import BoardCell from './BoardCell';

interface BoardTableViewProps {
  boardData: BoardData;
  rows: BoardRowWithCells[];
  groups: BoardGroup[];
  onCellUpdate: (rowId: string, columnId: string, value: Partial<BoardCellType>) => Promise<void>;
  onRowClick: (rowId: string) => void;
  onDeleteRow: (rowId: string) => void;
}

export default function BoardTableView({
  boardData,
  rows,
  groups,
  onCellUpdate,
  onRowClick,
  onDeleteRow,
}: BoardTableViewProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const visibleColumns = boardData.columns.filter(col => col.is_visible);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleCellClick = (rowId: string, columnId: string) => {
    setEditingCell({ rowId, columnId });
  };

  const handleCellSave = async (rowId: string, columnId: string, value: Partial<BoardCellType>) => {
    await onCellUpdate(rowId, columnId, value);
    setEditingCell(null);
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const renderRow = (row: BoardRowWithCells) => {
    const isEditing = editingCell?.rowId === row.id;
    const isHovered = hoveredRow === row.id;

    return (
      <tr
        key={row.id}
        className="border-b border-gray-200 hover:bg-gray-50 transition-colors group"
        onMouseEnter={() => setHoveredRow(row.id)}
        onMouseLeave={() => setHoveredRow(null)}
      >
        {/* Row actions */}
        <td className="w-12 px-2 py-1 sticky left-0 bg-white group-hover:bg-gray-50 border-r border-gray-200">
          <div className="flex items-center gap-1">
            <button
              className={`p-1 rounded hover:bg-gray-200 transition-opacity ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => onDeleteRow(row.id)}
              className={`p-1 rounded hover:bg-red-100 text-red-600 transition-opacity ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>

        {/* Cells */}
        {visibleColumns.map((column) => {
          const cell = row.cells.get(column.id);
          const isCellEditing = isEditing && editingCell?.columnId === column.id;

          return (
            <td
              key={column.id}
              className="px-3 py-2 border-r border-gray-200 cursor-pointer"
              style={{ minWidth: column.width, maxWidth: column.width }}
              onClick={() => !isCellEditing && handleCellClick(row.id, column.id)}
            >
              <BoardCell
                cell={cell}
                column={column}
                rowId={row.id}
                isEditing={isCellEditing}
                onSave={(value) => handleCellSave(row.id, column.id, value)}
                onCancel={handleCellCancel}
                onRowClick={() => onRowClick(row.id)}
              />
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="h-full overflow-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-gray-50 border-b-2 border-gray-300 z-10">
          <tr>
            {/* Row actions header */}
            <th className="w-12 px-2 py-3 text-left sticky left-0 bg-gray-50 border-r border-gray-300">
              <div className="w-4 h-4"></div>
            </th>

            {/* Column headers */}
            {visibleColumns.map((column) => (
              <th
                key={column.id}
                className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300"
                style={{ minWidth: column.width, maxWidth: column.width }}
              >
                <div className="flex items-center gap-2">
                  <span>{column.name}</span>
                  {column.is_required && (
                    <span className="text-red-500">*</span>
                  )}
                  {column.is_primary && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded">
                      PRIMARY
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {groups.length > 0 ? (
            // Grouped view
            groups.map((group) => {
              const isCollapsed = collapsedGroups.has(group.id);
              
              return (
                <React.Fragment key={group.id}>
                  {/* Group header */}
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <td colSpan={visibleColumns.length + 1} className="px-3 py-2">
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="flex items-center gap-2 w-full text-left font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        <span>{group.label}</span>
                        <span className="text-sm text-gray-500 font-normal">
                          ({group.rows.length})
                        </span>
                      </button>
                    </td>
                  </tr>

                  {/* Group rows */}
                  {!isCollapsed && group.rows.map(row => renderRow(row))}
                </React.Fragment>
              );
            })
          ) : rows.length > 0 ? (
            // Ungrouped view
            rows.map(row => renderRow(row))
          ) : (
            // Empty state
            <tr>
              <td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center">
                <div className="text-gray-500">
                  <p className="text-lg font-medium mb-2">No rows yet</p>
                  <p className="text-sm">Click "Add Row" to create your first entry</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
