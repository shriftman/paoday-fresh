'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Settings,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NewWorkspaceModal from './NewWorkspaceModal';

interface Workspace {
  id: string;
  name: string;
  type: 'company' | 'team' | 'personal' | 'folder';
  icon: string;
  color: string;
  parent_workspace_id: string | null;
  is_expanded: boolean;
  position: number;
  boards?: Board[];
}

interface Board {
  id: string;
  name: string;
  icon: string;
  color: string;
  workspace_id: string;
}

export default function WorkspaceSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [mainWorkspace, setMainWorkspace] = useState<Workspace | null>(null);
  const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(true);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      
      // Fetch all workspaces
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select('*')
        .order('position');

      if (workspacesError) throw workspacesError;

      // Fetch all boards
      const { data: boardsData, error: boardsError } = await supabase
        .from('boards')
        .select('id, name, icon, color, workspace_id')
        .order('position');

      if (boardsError) throw boardsError;

      // Find main workspace (company type with no parent)
      const main = workspacesData?.find(
        (w) => w.type === 'company' && w.parent_workspace_id === null
      ) || null;

      // Get child workspaces of main workspace
      const childWorkspaces = workspacesData?.filter(
        (w) => w.parent_workspace_id === main?.id
      ) || [];

      // Organize boards by workspace
      const workspacesWithBoards = childWorkspaces.map((workspace) => ({
        ...workspace,
        boards: boardsData?.filter((b) => b.workspace_id === workspace.id) || [],
      }));

      // Initialize expanded state for workspaces that are marked as expanded
      const expanded = new Set(
        workspacesData?.filter((w) => w.is_expanded).map((w) => w.id) || []
      );

      setMainWorkspace(main);
      setWorkspaces(workspacesWithBoards);
      setBoards(boardsData || []);
      setExpandedWorkspaces(expanded);
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkspaceExpanded = async (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);

    // Update in database
    await supabase
      .from('workspaces')
      .update({ is_expanded: newExpanded.has(workspaceId) })
      .eq('id', workspaceId);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const teamBoards = workspaces.find((w) => w.name === 'Team Boards');
  const individualBoards = workspaces.find((w) => w.name === 'Individual Boards');

  if (loading) {
    return (
      <div className={`${collapsed ? 'w-20' : 'w-64'} bg-[#1f2937] text-white h-screen fixed left-0 top-0 shadow-xl z-50`}>
        <div className="p-6 text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } bg-[#1f2937] text-white h-screen fixed left-0 top-0 transition-all duration-300 flex flex-col shadow-xl z-50 overflow-hidden`}
      >
        {/* Header with Main Workspace Dropdown */}
        <div className="p-4 border-b border-gray-700">
          {!collapsed && mainWorkspace && (
            <button
              onClick={() => setIsMainDropdownOpen(!isMainDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl">{mainWorkspace.icon}</span>
                <span className="font-semibold text-sm">{mainWorkspace.name}</span>
              </div>
              <ChevronDown 
                className={`w-4 h-4 transition-transform ${isMainDropdownOpen ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>
          )}
          {collapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xl mx-auto">
              {mainWorkspace?.icon || '🏢'}
            </div>
          )}
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-[#1f2937] border-2 border-gray-700 rounded-full p-1 hover:bg-gray-700 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Workspace Sections */}
        {!collapsed && isMainDropdownOpen && (
          <nav className="flex-1 py-4 overflow-y-auto">
            {/* Team Boards Section */}
            {teamBoards && (
              <div className="mb-4">
                <button
                  onClick={() => toggleWorkspaceExpanded(teamBoards.id)}
                  className="w-full flex items-center justify-between px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {expandedWorkspaces.has(teamBoards.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {teamBoards.icon} {teamBoards.name}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNewWorkspaceModal(true);
                    }}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </button>

                {expandedWorkspaces.has(teamBoards.id) && (
                  <div className="space-y-1 px-3 mt-1">
                    {teamBoards.boards && teamBoards.boards.length > 0 ? (
                      teamBoards.boards.map((board) => (
                        <Link
                          key={board.id}
                          href={`/dashboard/board/${board.id}`}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                            pathname === `/dashboard/board/${board.id}`
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          <span className="text-base">{board.icon}</span>
                          <span className="text-sm">{board.name}</span>
                        </Link>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-gray-500 italic">
                        No boards yet
                      </div>
                    )}
                    
                    {/* Legacy routes for CRM and Research */}
                    <Link
                      href="/dashboard/crm"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                        pathname === '/dashboard/crm'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span className="text-base">💼</span>
                      <span className="text-sm">CRM Pipeline</span>
                    </Link>
                    <Link
                      href="/dashboard/research"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                        pathname === '/dashboard/research'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span className="text-base">🔬</span>
                      <span className="text-sm">Research</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Individual Boards Section */}
            {individualBoards && (
              <div className="mb-4">
                <button
                  onClick={() => toggleWorkspaceExpanded(individualBoards.id)}
                  className="w-full flex items-center justify-between px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {expandedWorkspaces.has(individualBoards.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {individualBoards.icon} {individualBoards.name}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNewWorkspaceModal(true);
                    }}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </button>

                {expandedWorkspaces.has(individualBoards.id) && (
                  <div className="space-y-1 px-3 mt-1">
                    {individualBoards.boards && individualBoards.boards.length > 0 ? (
                      individualBoards.boards.map((board) => (
                        <Link
                          key={board.id}
                          href={`/dashboard/board/${board.id}`}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                            pathname === `/dashboard/board/${board.id}`
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          <span className="text-base">{board.icon}</span>
                          <span className="text-sm">{board.name}</span>
                        </Link>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-gray-500 italic">
                        No personal boards yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Add New Workspace Button */}
            <button
              onClick={() => setShowNewWorkspaceModal(true)}
              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors mx-auto text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Workspace</span>
            </button>
          </nav>
        )}

        {/* Footer - Settings & Logout */}
        <div className="p-3 border-t border-gray-700 space-y-1">
          {!collapsed && (
            <>
              <Link
                href="/dashboard/settings"
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">Logout</span>
              </button>
            </>
          )}
          {collapsed && (
            <>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="w-full flex items-center justify-center p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* New Workspace Modal */}
      {showNewWorkspaceModal && (
        <NewWorkspaceModal
          onClose={() => setShowNewWorkspaceModal(false)}
          onSuccess={() => {
            loadWorkspaces();
            setShowNewWorkspaceModal(false);
          }}
          mainWorkspaceId={mainWorkspace?.id}
        />
      )}
    </>
  );
}
