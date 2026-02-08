// Phase 3: Research Boards - Type Definitions

export type ColumnType = 
  | 'status'
  | 'person'
  | 'files'
  | 'date'
  | 'text'
  | 'number'
  | 'vote'
  | 'checkbox'
  | 'link'
  | 'email'
  | 'phone';

export type ViewType = 'table' | 'kanban';

// Status label definition
export interface StatusLabel {
  id: string;
  label: string;
  color: string;
}

// Column settings types
export interface StatusColumnSettings {
  labels: StatusLabel[];
}

export interface PersonColumnSettings {
  allow_multiple?: boolean;
}

export interface NumberColumnSettings {
  format?: 'number' | 'currency' | 'percentage';
  currency?: string;
  decimals?: number;
}

export interface FilesColumnSettings {
  max_files?: number;
  allowed_types?: string[];
}

export interface DateColumnSettings {
  format?: 'date' | 'datetime';
  include_time?: boolean;
}

export interface TextColumnSettings {
  multiline?: boolean;
  max_length?: number;
}

export interface VoteColumnSettings {
  max_votes?: number;
}

export type ColumnSettings = 
  | StatusColumnSettings
  | PersonColumnSettings
  | NumberColumnSettings
  | FilesColumnSettings
  | DateColumnSettings
  | TextColumnSettings
  | VoteColumnSettings
  | Record<string, unknown>;

// Cell value types
export interface StatusCellValue {
  status_id: string;
  label: string;
  color: string;
}

export interface PersonCellValue {
  user_id?: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface FileCellValue {
  id: string;
  name: string;
  url: string;
  size: number;
  type?: string;
}

export interface VoteCellValue {
  votes: number;
  max_votes?: number;
  voters?: string[];
}

// Database entities
export interface Board {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  default_view: ViewType;
  default_group_by_column_id?: string;
  user_id: string;
  is_template: boolean;
  position: number;
}

export interface BoardColumn {
  id: string;
  created_at: string;
  updated_at: string;
  board_id: string;
  name: string;
  column_type: ColumnType;
  settings: ColumnSettings;
  width: number;
  position: number;
  is_visible: boolean;
  is_required: boolean;
  is_primary: boolean;
}

export interface BoardRow {
  id: string;
  created_at: string;
  updated_at: string;
  board_id: string;
  position: number;
  is_archived: boolean;
  created_by?: string;
  updated_by?: string;
}

export interface BoardCell {
  id: string;
  created_at: string;
  updated_at: string;
  row_id: string;
  column_id: string;
  value_text?: string;
  value_number?: number;
  value_date?: string;
  value_boolean?: boolean;
  value_json?: unknown;
}

// Enriched types for rendering
export interface BoardRowWithCells extends BoardRow {
  cells: Map<string, BoardCell>; // column_id -> cell
}

export interface BoardData {
  board: Board;
  columns: BoardColumn[];
  rows: BoardRowWithCells[];
}

// Filter and sort types
export type FilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'is_empty'
  | 'is_not_empty'
  | 'greater_than'
  | 'less_than'
  | 'is_any_of';

export interface BoardFilter {
  id: string;
  column_id: string;
  operator: FilterOperator;
  value: unknown;
}

export type SortDirection = 'asc' | 'desc';

export interface BoardSort {
  column_id: string;
  direction: SortDirection;
}

// Group by types
export interface BoardGroup {
  id: string;
  label: string;
  value: unknown;
  rows: BoardRowWithCells[];
  collapsed?: boolean;
}

// UI State
export interface BoardViewState {
  view: ViewType;
  groupByColumnId?: string;
  filters: BoardFilter[];
  sorts: BoardSort[];
  selectedRowIds: Set<string>;
  isRowDetailOpen: boolean;
  selectedRowId?: string;
}

// Cell editing
export interface CellEditorProps {
  cell: BoardCell | undefined;
  column: BoardColumn;
  rowId: string;
  onSave: (value: Partial<BoardCell>) => Promise<void>;
  onCancel: () => void;
  autoFocus?: boolean;
}

// Helper functions
export function getCellDisplayValue(cell: BoardCell | undefined, column: BoardColumn): string {
  if (!cell) return '';

  switch (column.column_type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'link':
      return cell.value_text || '';
    
    case 'number':
      if (cell.value_number === null || cell.value_number === undefined) return '';
      const settings = column.settings as NumberColumnSettings;
      if (settings.format === 'currency') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: settings.currency || 'USD',
        }).format(cell.value_number);
      }
      if (settings.format === 'percentage') {
        return `${cell.value_number}%`;
      }
      return cell.value_number.toString();
    
    case 'date':
      if (!cell.value_date) return '';
      const date = new Date(cell.value_date);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    
    case 'status':
      const status = cell.value_json as StatusCellValue | undefined;
      return status?.label || '';
    
    case 'person':
      const person = cell.value_json as PersonCellValue | undefined;
      return person?.name || '';
    
    case 'files':
      const files = cell.value_json as FileCellValue[] | undefined;
      return files && files.length > 0 ? `${files.length} file(s)` : '';
    
    case 'vote':
      const vote = cell.value_json as VoteCellValue | undefined;
      return vote ? `${vote.votes}${vote.max_votes ? `/${vote.max_votes}` : ''}` : '0';
    
    case 'checkbox':
      return cell.value_boolean ? '✓' : '';
    
    default:
      return '';
  }
}

export function getEmptyCell(columnId: string, rowId: string): Partial<BoardCell> {
  return {
    column_id: columnId,
    row_id: rowId,
  };
}
