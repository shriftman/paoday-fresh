'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface NewWorkspaceModalProps {
  onClose: () => void;
  onSuccess: () => void;
  mainWorkspaceId?: string;
}

const workspaceTypes = [
  {
    value: 'team',
    label: 'Team Workspace',
    description: 'Collaborative workspace for teams',
    icon: '👥',
    color: '#10B981',
  },
  {
    value: 'personal',
    label: 'Personal Workspace',
    description: 'Private workspace for individual use',
    icon: '👤',
    color: '#8B5CF6',
  },
  {
    value: 'folder',
    label: 'Folder',
    description: 'Organize workspaces into folders',
    icon: '📁',
    color: '#F59E0B',
  },
];

const iconOptions = [
  '📋', '💼', '🔬', '📊', '🎯', '🚀', '💡', '🏆',
  '📈', '🎨', '🔧', '📱', '💻', '🌟', '🎭', '📚',
  '🎓', '🏢', '🏠', '⚡', '🔥', '💰', '🎪', '🎬'
];

const colorOptions = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' },
];

export default function NewWorkspaceModal({ onClose, onSuccess, mainWorkspaceId }: NewWorkspaceModalProps) {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<string>('team');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📋');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [parentSection, setParentSection] = useState<'team' | 'individual'>('team');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    const typeInfo = workspaceTypes.find((t) => t.value === type);
    if (typeInfo) {
      setSelectedIcon(typeInfo.icon);
      setSelectedColor(typeInfo.color);
    }
    setStep('details');
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the parent workspace ID based on selected section
      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id, name')
        .eq('parent_workspace_id', mainWorkspaceId);

      const parentWorkspace = workspaces?.find((w) => 
        parentSection === 'team' 
          ? w.name === 'Team Boards' 
          : w.name === 'Individual Boards'
      );

      // Get the max position for ordering
      const { data: existingWorkspaces } = await supabase
        .from('workspaces')
        .select('position')
        .eq('parent_workspace_id', parentWorkspace?.id)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = existingWorkspaces && existingWorkspaces.length > 0
        ? existingWorkspaces[0].position + 1
        : 0;

      // Create the workspace
      const { data: newWorkspace, error: insertError } = await supabase
        .from('workspaces')
        .insert({
          name: name.trim(),
          description: description.trim(),
          icon: selectedIcon,
          color: selectedColor,
          type: selectedType,
          parent_workspace_id: parentWorkspace?.id,
          user_id: user.id,
          position: nextPosition,
          is_expanded: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // If creating a workspace, also create a default board for it
      if (selectedType !== 'folder' && newWorkspace) {
        await supabase
          .from('boards')
          .insert({
            name: `${name} Board`,
            description: `Default board for ${name}`,
            icon: selectedIcon,
            color: selectedColor,
            workspace_id: newWorkspace.id,
            user_id: user.id,
            position: 0,
          });
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error creating workspace:', err);
      setError(err.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'type' ? 'Choose Workspace Type' : 'Workspace Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'type' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                Select the type of workspace you want to create
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {workspaceTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleTypeSelect(type.value)}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all text-left"
                  >
                    <div className="text-4xl mb-3">{type.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{type.label}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-6">
              {/* Workspace Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter workspace name"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a description (optional)"
                  rows={3}
                />
              </div>

              {/* Parent Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add to Section
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setParentSection('team')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                      parentSection === 'team'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl mb-1">👥</div>
                    <div className="font-medium">Team Boards</div>
                  </button>
                  <button
                    onClick={() => setParentSection('individual')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                      parentSection === 'individual'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl mb-1">👤</div>
                    <div className="font-medium">Individual Boards</div>
                  </button>
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Icon
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                        selectedIcon === icon
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Color
                </label>
                <div className="flex space-x-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        selectedColor === color.value
                          ? 'border-gray-800 scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div 
                  className="p-4 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: `${selectedColor}15` }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{selectedIcon}</span>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {name || 'Workspace Name'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {description || 'Workspace description'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={() => {
              if (step === 'details') {
                setStep('type');
              } else {
                onClose();
              }
            }}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {step === 'details' ? 'Back' : 'Cancel'}
          </button>
          {step === 'details' && (
            <button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Workspace'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
