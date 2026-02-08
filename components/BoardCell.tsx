'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BoardCell as BoardCellType, BoardColumn, getCellDisplayValue, StatusCellValue, PersonCellValue, FileCellValue } from '@/lib/types/board';
import { Calendar, User, FileText, Check, X, ExternalLink } from 'lucide-react';

interface BoardCellProps {
  cell: BoardCellType | undefined;
  column: BoardColumn;
  rowId: string;
  isEditing: boolean;
  onSave: (value: Partial<BoardCellType>) => Promise<void>;
  onCancel: () => void;
  onRowClick: () => void;
}

export default function BoardCell({
  cell,
  column,
  rowId,
  isEditing,
  onSave,
  onCancel,
  onRowClick,
}: BoardCellProps) {
  const [editValue, setEditValue] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (column.column_type === 'text') {
        setEditValue(cell?.value_text || '');
      } else if (column.column_type === 'number') {
        setEditValue(cell?.value_number?.toString() || '');
      } else if (column.column_type === 'email' || column.column_type === 'phone' || column.column_type === 'link') {
        setEditValue(cell?.value_text || '');
      }
    }
  }, [isEditing, cell, column.column_type]);

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    try {
      let valueToSave: Partial<BoardCellType> = {};

      if (column.column_type === 'text' || column.column_type === 'email' || column.column_type === 'phone' || column.column_type === 'link') {
        valueToSave = { value_text: editValue };
      } else if (column.column_type === 'number') {
        const numValue = parseFloat(editValue);
        valueToSave = { value_number: isNaN(numValue) ? undefined : numValue };
      }

      await onSave(valueToSave);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  // Render editing mode
  if (isEditing) {
    if (column.column_type === 'status') {
      const settings = column.settings as { labels?: Array<{ id: string; label: string; color: string }> };
      const labels = settings.labels || [];
      const currentValue = cell?.value_json as StatusCellValue | undefined;

      return (
        <div className="flex flex-col gap-1 py-1" onClick={(e) => e.stopPropagation()}>
          {labels.map((label) => (
            <button
              key={label.id}
              onClick={async () => {
                await onSave({
                  value_json: { status_id: label.id, label: label.label, color: label.color },
                });
              }}
              className={`px-3 py-1.5 rounded text-sm text-left transition-colors ${
                currentValue?.status_id === label.id
                  ? 'bg-blue-100 border border-blue-300'
                  : 'hover:bg-gray-100 border border-transparent'
              }`}
              style={{
                backgroundColor: currentValue?.status_id === label.id ? `${label.color}20` : undefined,
                borderColor: currentValue?.status_id === label.id ? label.color : undefined,
              }}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: label.color }}></span>
              {label.label}
            </button>
          ))}
          <button
            onClick={onCancel}
            className="mt-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
        </div>
      );
    }

    if (column.column_type === 'date') {
      return (
        <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="date"
            defaultValue={cell?.value_date ? new Date(cell.value_date).toISOString().split('T')[0] : ''}
            onChange={async (e) => {
              if (e.target.value) {
                await onSave({ value_date: new Date(e.target.value).toISOString() });
              }
            }}
            onKeyDown={handleKeyDown}
            className="px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-1">
            <button
              onClick={onCancel}
              className="flex-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (column.column_type === 'checkbox') {
      return (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="checkbox"
            defaultChecked={cell?.value_boolean || false}
            onChange={async (e) => {
              await onSave({ value_boolean: e.target.checked });
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
      );
    }

    if (column.column_type === 'person') {
      const currentValue = cell?.value_json as PersonCellValue | undefined;
      
      return (
        <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            placeholder="Name"
            defaultValue={currentValue?.name || ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            defaultValue={currentValue?.email || ''}
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-1">
            <button
              onClick={async () => {
                const nameInput = inputRef.current as HTMLInputElement;
                const emailInput = nameInput?.nextElementSibling as HTMLInputElement;
                await onSave({
                  value_json: {
                    name: nameInput?.value || '',
                    email: emailInput?.value || '',
                    avatar: currentValue?.avatar || '',
                  },
                });
              }}
              className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    // Text, number, email, phone, link - simple input
    const isMultiline = column.column_type === 'text' && (column.settings as any)?.multiline;

    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {isMultiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
            rows={3}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={column.column_type === 'number' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Render display mode
  const displayValue = getCellDisplayValue(cell, column);

  if (column.column_type === 'status') {
    const statusValue = cell?.value_json as StatusCellValue | undefined;
    if (!statusValue) {
      return <div className="text-gray-400 text-sm">-</div>;
    }

    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
        style={{
          backgroundColor: `${statusValue.color}20`,
          color: statusValue.color,
          border: `1px solid ${statusValue.color}40`,
        }}
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusValue.color }}></span>
        {statusValue.label}
      </div>
    );
  }

  if (column.column_type === 'person') {
    const personValue = cell?.value_json as PersonCellValue | undefined;
    if (!personValue || !personValue.name) {
      return <div className="text-gray-400 text-sm">-</div>;
    }

    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
          {personValue.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{personValue.name}</span>
          {personValue.email && (
            <span className="text-xs text-gray-500">{personValue.email}</span>
          )}
        </div>
      </div>
    );
  }

  if (column.column_type === 'files') {
    const filesValue = cell?.value_json as FileCellValue[] | undefined;
    if (!filesValue || filesValue.length === 0) {
      return <div className="text-gray-400 text-sm">-</div>;
    }

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {filesValue.map((file) => (
          <a
            key={file.id}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="w-3 h-3" />
            {file.name}
          </a>
        ))}
      </div>
    );
  }

  if (column.column_type === 'date') {
    if (!displayValue) {
      return <div className="text-gray-400 text-sm">-</div>;
    }

    return (
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Calendar className="w-4 h-4 text-gray-400" />
        {displayValue}
      </div>
    );
  }

  if (column.column_type === 'checkbox') {
    return (
      <div className="flex items-center">
        {cell?.value_boolean ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <div className="w-4 h-4 border border-gray-300 rounded"></div>
        )}
      </div>
    );
  }

  if (column.column_type === 'link' && displayValue) {
    return (
      <a
        href={displayValue}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="w-3 h-3" />
        {displayValue}
      </a>
    );
  }

  if (column.column_type === 'number') {
    if (!displayValue) {
      return <div className="text-gray-400 text-sm">-</div>;
    }

    return (
      <div className="text-sm font-medium text-gray-900 tabular-nums">
        {displayValue}
      </div>
    );
  }

  // Default text display
  if (!displayValue) {
    return <div className="text-gray-400 text-sm">-</div>;
  }

  return (
    <div className="text-sm text-gray-700 truncate" title={displayValue}>
      {displayValue}
    </div>
  );
}
