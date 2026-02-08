import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ResearchBoard from '@/components/ResearchBoard';

export default async function ResearchPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get the first board (or create one if none exists)
  const { data: boards } = await supabase
    .from('boards')
    .select('*')
    .order('position', { ascending: true })
    .limit(1);

  let boardId = boards?.[0]?.id;

  // If no board exists, we'll show a message
  if (!boardId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Research Boards
          </h1>
          <p className="text-gray-600 mb-6">
            No research boards found. Please run the database migration to create sample data.
          </p>
          <div className="p-4 bg-gray-50 rounded-lg text-left text-sm">
            <p className="font-semibold mb-2">To set up your research board:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Open Supabase SQL Editor</li>
              <li>Run the migration file: <code className="bg-gray-200 px-1 rounded">supabase/migrations/002_create_research_boards.sql</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <ResearchBoard boardId={boardId} />
    </div>
  );
}
