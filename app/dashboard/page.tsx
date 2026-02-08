import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch deals statistics
  const { data: deals } = await supabase.from('deals').select('*');

  const stats = {
    totalDeals: deals?.length || 0,
    pipelineDeals: deals?.filter((d) => d.stage === 'pipeline').length || 0,
    activeDeals: deals?.filter((d) => d.stage === 'active').length || 0,
    investedDeals: deals?.filter((d) => d.stage === 'invested').length || 0,
    totalValue: deals?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back!
        </h1>
        <p className="text-gray-600 text-lg">
          {user.email}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.totalDeals}
          </h3>
          <p className="text-sm text-gray-600">Total Deals</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Active</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.activeDeals}
          </h3>
          <p className="text-sm text-gray-600">Active Deals</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Pipeline</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.pipelineDeals}
          </h3>
          <p className="text-sm text-gray-600">In Pipeline</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Value</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.totalValue)}
          </h3>
          <p className="text-sm text-gray-600">Total Pipeline Value</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/crm"
            className="flex items-center space-x-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all border-2 border-blue-200"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Pipeline</h3>
              <p className="text-sm text-gray-600">Manage your deals</p>
            </div>
          </Link>

          <button className="flex items-center space-x-4 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all border-2 border-green-200">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Contact</h3>
              <p className="text-sm text-gray-600">Create new contact</p>
            </div>
          </button>

          <button className="flex items-center space-x-4 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all border-2 border-purple-200">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">New Deal</h3>
              <p className="text-sm text-gray-600">Create new deal</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Deals</h2>
        <div className="space-y-4">
          {deals?.slice(0, 5).map((deal) => (
            <div
              key={deal.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {deal.company_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {deal.company_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {deal.owner || 'Unassigned'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    deal.stage === 'pipeline'
                      ? 'bg-blue-100 text-blue-700'
                      : deal.stage === 'active'
                      ? 'bg-green-100 text-green-700'
                      : deal.stage === 'passed'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
                </span>
                {deal.amount && (
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {formatCurrency(deal.amount)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
