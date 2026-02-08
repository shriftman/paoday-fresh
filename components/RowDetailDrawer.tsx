'use client';

import React, { useState } from 'react';
import { BoardData, BoardCell as BoardCellType, getCellDisplayValue } from '@/lib/types/board';
import { X, Trash2, Calendar, User } from 'lucide-react';
import BoardCell from './BoardCell';

interface RowDetailDrawerProps {
  boardData: BoardData;
  rowId: string;
  onClose: () => void;
  onCellUpdate: (rowId: string, columnId: string, value: Partial<BoardCellType>) => Promise<void>;
  onDeleteRow: (rowId: string) => void;
}

export default function RowDetailDrawer({
  boardData,
  rowId,
  onClose,
  onCellUpdate,
  onDeleteRow,
}: RowDetailDrawerProps) {
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const row = boardData.rows.find(r => r.id === rowId);

  if (!row) {
    return null;
  }

  // Get primary column for title
  const primaryColumn = boardData.columns.find(c => c.is_primary) || boardData.columns[0];
  const titleCell = primaryColumn ? row.cells.get(primaryColumn.id) : undefined;
  const title = titleCell ? getCellDisplayValue(titleCell, primaryColumn) : 'Untitled';

  const handleDelete = async () => {
    await onDeleteRow(rowId);
    onClose();
  };

  const handleCellSave = async (columnId: string, value: Partial<BoardCellType>) => {
    await onCellUpdate(rowId, columnId, value);
    setEditingColumnId(null);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[600px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">{title}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  Created {new Date(row.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>Last updated {new Date(row.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Delete row"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {boardData.columns.map((column) => {
              const cell = row.cells.get(column.id);
              const isEditing = editingColumnId === column.id;
              const displayValue = getCellDisplayValue(cell, column);

              return (
                <div key={column.id} className="space-y-2">
                  {/* Column label */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      {column.name}
                    </label>
                    {column.is_required && (
                      <span className="text-red-500 text-sm">*</span>
                    )}
                    {column.is_primary && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded">
                        PRIMARY
                      </span>
                    )}
                  </div>

                  {/* Cell value */}
                  <div
                    className={`p-3 border-2 rounded-lg transition-colors ${
                      isEditing
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 cursor-pointer bg-white'
                    }`}
                    onClick={() => !isEditing && setEditingColumnId(column.id)}
                  >
                    <BoardCell
                      cell={cell}
                      column={column}
                      rowId={rowId}
                      isEditing={isEditing}
                      onSave={(value) => handleCellSave(column.id, value)}
                      onCancel={() => setEditingColumnId(null)}
                      onRowClick={() => {}}
                    />
                  </div>

                  {/* Column description */}
                  {column.column_type === 'status' && !isEditing && (
                    <p className="text-xs text-gray-500">
                      Click to change status
                    </p>
                  )}
                  {column.column_type === 'person' && !isEditing && (
                    <p className="text-xs text-gray-500">
                      Click to assign person
                    </p>
                  )}
                  {column.column_type === 'date' && !isEditing && (
                    <p className="text-xs text-gray-500">
                      Click to set date
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Row ID: {rowId.slice(0, 8)}...</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 z-[70] w-96">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Row?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this row? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
