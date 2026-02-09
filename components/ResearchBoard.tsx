'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Board,
  BoardColumn,
  BoardRow,
  BoardCell,
  BoardRowWithCells,
  BoardData,
  BoardViewState,
  ViewType,
  BoardFilter,
  BoardSort,
  BoardGroup,
} from '@/lib/types/board';
import { Plus, Search, Filter, SortAsc, Layout, LayoutGrid, ChevronDown, ChevronRight } from 'lucide-react';
import BoardTableView from './BoardTableView';
import BoardKanbanView from './BoardKanbanView';
import BoardFiltersBar from './BoardFiltersBar';
import RowDetailDrawer from './RowDetailDrawer';

interface ResearchBoardProps {
  boardId: string;
}

export default function ResearchBoard({ boardId }: ResearchBoardProps) {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [viewState, setViewState] = useState<BoardViewState>({
    view: 'table',
    filters: [],
    sorts: [],
    selectedRowIds: new Set(),
    isRowDetailOpen: false,
  });

  const [groups, setGroups] = useState<BoardGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const supabase = createClient();

  // Load board data
  const loadBoardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load board
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .select('*')
        .eq('id', boardId)
        .single();

      if (boardError) throw boardError;
      if (!board) throw new Error('Board not found');

      // Load columns
      const { data: columns, error: columnsError } = await supabase
        .from('board_columns')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });

      if (columnsError) throw columnsError;

      // Load rows
      const { data: rows, error: rowsError } = await supabase
        .from('board_rows')
        .select('*')
        .eq('board_id', boardId)
        .eq('is_archived', false)
        .order('position', { ascending: true });

      if (rowsError) throw rowsError;

      // Load all cells for these rows
      const rowIds = rows?.map(r => r.id) || [];
      const { data: cells, error: cellsError } = await supabase
        .from('board_cells')
        .select('*')
        .in('row_id', rowIds);

      if (cellsError) throw cellsError;

      // Map cells to rows
      const rowsWithCells: BoardRowWithCells[] = (rows || []).map(row => {
        const rowCells = (cells || []).filter(c => c.row_id === row.id);
        const cellMap = new Map<string, BoardCell>();
        rowCells.forEach(cell => {
          cellMap.set(cell.column_id, cell);
        });
        return {
          ...row,
          cells: cellMap,
        };
      });

      setBoardData({
        board: board as Board,
        columns: (columns as BoardColumn[]) || [],
        rows: rowsWithCells,
      });

      // Set default view from board settings
      setViewState(prev => ({
        ...prev,
        view: board.default_view as ViewType,
        groupByColumnId: board.default_group_by_column_id,
      }));

    } catch (err) {
      console.error('Error loading board:', err);
      setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [boardId, supabase]);

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData]);

  // Apply grouping when groupByColumnId changes
  useEffect(() => {
    if (!boardData || !viewState.groupByColumnId) {
      setGroups([]);
      return;
    }

    const groupColumn = boardData.columns.find(c => c.id === viewState.groupByColumnId);
    if (!groupColumn) {
      setGroups([]);
      return;
    }

    // Group rows by column value
    const groupMap = new Map<string, BoardRowWithCells[]>();
    
    boardData.rows.forEach(row => {
      const cell = row.cells.get(viewState.groupByColumnId!);
      let groupKey = '_empty';
      let groupLabel = '(No value)';

      if (cell) {
        if (groupColumn.column_type === 'status') {
          const statusValue = cell.value_json as { status_id: string; label: string; color: string } | undefined;
          groupKey = statusValue?.status_id || '_empty';
          groupLabel = statusValue?.label || '(No value)';
        } else if (groupColumn.column_type === 'text') {
          groupKey = cell.value_text || '_empty';
          groupLabel = cell.value_text || '(No value)';
        } else if (groupColumn.column_type === 'person') {
          const personValue = cell.value_json as { name: string } | undefined;
          groupKey = personValue?.name || '_empty';
          groupLabel = personValue?.name || '(No value)';
        } else if (groupColumn.column_type === 'date') {
          if (cell.value_date) {
            const date = new Date(cell.value_date);
            // Group by week
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            groupKey = weekStart.toISOString().split('T')[0];
            groupLabel = `Week of ${weekStart.toLocaleDateString()}`;
          } else {
            groupKey = '_empty';
            groupLabel = '(No date)';
          }
        }
      }

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, []);
      }
      groupMap.get(groupKey)!.push(row);
    });

    const groupsArray: BoardGroup[] = Array.from(groupMap.entries()).map(([key, rows]) => ({
      id: key,
      label: rows[0]?.cells.get(viewState.groupByColumnId!)?.value_text || key,
      value: key,
      rows,
      collapsed: false,
    }));

    setGroups(groupsArray);
  }, [boardData, viewState.groupByColumnId]);

  // Filter and sort rows
  const getFilteredAndSortedRows = useCallback(() => {
    if (!boardData) return [];

    let filteredRows = [...boardData.rows];

    // Apply search
    if (searchQuery) {
      filteredRows = filteredRows.filter(row => {
        return boardData.columns.some(col => {
          const cell = row.cells.get(col.id);
          if (!cell) return false;
          
          const searchLower = searchQuery.toLowerCase();
          
          if (cell.value_text?.toLowerCase().includes(searchLower)) return true;
          if (cell.value_number?.toString().includes(searchLower)) return true;
          
          if (col.column_type === 'status') {
            const status = cell.value_json as { label: string } | undefined;
            if (status?.label.toLowerCase().includes(searchLower)) return true;
          }
          
          if (col.column_type === 'person') {
            const person = cell.value_json as { name: string; email?: string } | undefined;
            if (person?.name.toLowerCase().includes(searchLower)) return true;
            if (person?.email?.toLowerCase().includes(searchLower)) return true;
          }
          
          return false;
        });
      });
    }

    // Apply filters (simple implementation)
    // TODO: Implement full filter logic with operators

    // Apply sorts
    if (viewState.sorts.length > 0) {
      filteredRows.sort((a, b) => {
        for (const sort of viewState.sorts) {
          const cellA = a.cells.get(sort.column_id);
          const cellB = b.cells.get(sort.column_id);
          
          const valueA = cellA?.value_text || cellA?.value_number || '';
          const valueB = cellB?.value_text || cellB?.value_number || '';
          
          if (valueA < valueB) return sort.direction === 'asc' ? -1 : 1;
          if (valueA > valueB) return sort.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredRows;
  }, [boardData, searchQuery, viewState.sorts]);

  // Handle cell update
  const handleCellUpdate = async (rowId: string, columnId: string, value: Partial<BoardCell>) => {
    if (!boardData) return;

    try {
      const existingCell = boardData.rows
        .find(r => r.id === rowId)
        ?.cells.get(columnId);

      if (existingCell) {
        // Update existing cell
        const { error } = await supabase
          .from('board_cells')
          .update(value)
          .eq('id', existingCell.id);

        if (error) throw error;
      } else {
        // Insert new cell
        const { error } = await supabase
          .from('board_cells')
          .insert({
            row_id: rowId,
            column_id: columnId,
            ...value,
          });

        if (error) throw error;
      }

      // Reload board data
      await loadBoardData();
    } catch (err) {
      console.error('Error updating cell:', err);
      setError(err instanceof Error ? err.message : 'Failed to update cell');
    }
  };

  // Handle add row
  const handleAddRow = async () => {
    if (!boardData) return;

    try {
      const maxPosition = Math.max(...boardData.rows.map(r => r.position), -1);
      
      const { error } = await supabase
        .from('board_rows')
        .insert({
          board_id: boardId,
          position: maxPosition + 1,
        });

      if (error) throw error;

      await loadBoardData();
    } catch (err) {
      console.error('Error adding row:', err);
      setError(err instanceof Error ? err.message : 'Failed to add row');
    }
  };

  // Handle delete row
  const handleDeleteRow = async (rowId: string) => {
    try {
      const { error } = await supabase
        .from('board_rows')
        .delete()
        .eq('id', rowId);

      if (error) throw error;

      await loadBoardData();
    } catch (err) {
      console.error('Error deleting row:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete row');
    }
  };

  // Handle row click
  const handleRowClick = (rowId: string) => {
    setViewState(prev => ({
      ...prev,
      selectedRowId: rowId,
      isRowDetailOpen: true,
    }));
  };

  // Handle close detail drawer
  const handleCloseDetail = () => {
    setViewState(prev => ({
      ...prev,
      isRowDetailOpen: false,
      selectedRowId: undefined,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !boardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load board'}</p>
          <button
            onClick={loadBoardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredRows = getFilteredAndSortedRows();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl text-[var(--color-primary)]">{boardData.board.icon || '📊'}</span>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-primary)]">{boardData.board.name}</h1>
              {boardData.board.description && (
                <p className="text-sm text-gray-500">{boardData.board.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewState(prev => ({ ...prev, view: 'table' }))}
                className={`px-3 py-2 rounded ${
                  viewState.view === 'table'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layout className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewState(prev => ({ ...prev, view: 'kanban' }))}
                className={`px-3 py-2 rounded ${
                  viewState.view === 'kanban'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddRow}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Group by */}
          <select
            value={viewState.groupByColumnId || ''}
            onChange={(e) => setViewState(prev => ({ 
              ...prev, 
              groupByColumnId: e.target.value || undefined 
            }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No grouping</option>
            {boardData.columns
              .filter(col => ['status', 'person', 'date', 'text'].includes(col.column_type))
              .map(col => (
                <option key={col.id} value={col.id}>
                  Group by {col.name}
                </option>
              ))}
          </select>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
              showFilters || viewState.filters.length > 0
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            {viewState.filters.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                {viewState.filters.length}
              </span>
            )}
          </button>

          {/* Sort */}
          <button
            onClick={() => {
              // Toggle sort on first column for demo
              const firstCol = boardData.columns[0];
              if (firstCol) {
                setViewState(prev => ({
                  ...prev,
                  sorts: prev.sorts.length > 0 ? [] : [{ column_id: firstCol.id, direction: 'asc' }],
                }));
              }
            }}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
              viewState.sorts.length > 0
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SortAsc className="w-4 h-4" />
            Sort
          </button>
        </div>

        {/* Filters bar */}
        {showFilters && (
          <BoardFiltersBar
            columns={boardData.columns}
            filters={viewState.filters}
            onFiltersChange={(filters) => setViewState(prev => ({ ...prev, filters }))}
          />
        )}
      </div>

      {/* Board view */}
      <div className="flex-1 overflow-hidden">
        {viewState.view === 'table' ? (
          <BoardTableView
            boardData={boardData}
            rows={viewState.groupByColumnId ? [] : filteredRows}
            groups={viewState.groupByColumnId ? groups : []}
            onCellUpdate={handleCellUpdate}
            onRowClick={handleRowClick}
            onDeleteRow={handleDeleteRow}
          />
        ) : (
          <BoardKanbanView
            boardData={boardData}
            rows={filteredRows}
            groupByColumnId={viewState.groupByColumnId}
            onCellUpdate={handleCellUpdate}
            onRowClick={handleRowClick}
          />
        )}
      </div>

      {/* Row detail drawer */}
      {viewState.isRowDetailOpen && viewState.selectedRowId && (
        <RowDetailDrawer
          boardData={boardData}
          rowId={viewState.selectedRowId}
          onClose={handleCloseDetail}
          onCellUpdate={handleCellUpdate}
          onDeleteRow={handleDeleteRow}
        />
      )}
    </div>
  );
}
