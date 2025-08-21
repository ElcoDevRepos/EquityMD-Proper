import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Search, MapPin, DollarSign, TrendingUp, Clock, Plus, Edit, Archive, Eye, Save, X } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  location: string;
  property_type: string;
  minimum_investment: number;
  target_irr: number;
  investment_term: number;
  status: string;
  cover_image_url: string;
  created_at: string;
  syndicator: {
    company_name: string;
  };
}

interface EditingDeal {
  id: string;
  title: string;
  location: string;
  property_type: string;
  minimum_investment: number;
  target_irr: number;
  investment_term: number;
  status: string;
  cover_image_url: string;
}

export function PropertyManagement() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [editingDeal, setEditingDeal] = useState<EditingDeal | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          syndicator:syndicator_id (
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setDeals(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.syndicator?.company_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filter === 'all' ||
      deal.status === filter;

    return matchesSearch && matchesFilter;
  });

  const updateDealStatus = async (dealId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ status })
        .eq('id', dealId);

      if (error) throw error;

      setDeals(deals.map(deal => 
        deal.id === dealId ? { ...deal, status } : deal
      ));
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  };

  const startEditing = (deal: Deal) => {
    setEditingDeal({
      id: deal.id,
      title: deal.title,
      location: deal.location,
      property_type: deal.property_type,
      minimum_investment: deal.minimum_investment,
      target_irr: deal.target_irr,
      investment_term: deal.investment_term,
      status: deal.status,
      cover_image_url: deal.cover_image_url
    });
  };

  const cancelEditing = () => {
    setEditingDeal(null);
  };

  const saveDeal = async () => {
    if (!editingDeal) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('deals')
        .update({
          title: editingDeal.title,
          location: editingDeal.location,
          property_type: editingDeal.property_type,
          minimum_investment: editingDeal.minimum_investment,
          target_irr: editingDeal.target_irr,
          investment_term: editingDeal.investment_term,
          status: editingDeal.status,
          cover_image_url: editingDeal.cover_image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingDeal.id);

      if (error) throw error;

      // Update local state
      setDeals(deals.map(deal => 
        deal.id === editingDeal.id ? { ...deal, ...editingDeal } : deal
      ));

      setEditingDeal(null);
      alert('Deal updated successfully!');
    } catch (error) {
      console.error('Error saving deal:', error);
      alert('Error saving deal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateEditingField = (field: keyof EditingDeal, value: string | number) => {
    if (!editingDeal) return;
    setEditingDeal({ ...editingDeal, [field]: value });
  };

  if (loading) {
    return <div>Loading properties...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Property Management</h2>
        <div className="flex gap-4">
          <Link
            to="/deals/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Property
          </Link>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Properties</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Syndicator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDeals.map((deal) => {
              const isEditing = editingDeal?.id === deal.id;
              
              return (
                <tr key={deal.id} className={isEditing ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          src={deal.cover_image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'}
                          alt={deal.title}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingDeal.title}
                              onChange={(e) => updateEditingField('title', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="text"
                              value={editingDeal.location}
                              onChange={(e) => updateEditingField('location', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Location"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {deal.location}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{deal.syndicator?.company_name}</div>
                    {isEditing ? (
                      <select
                        value={editingDeal.property_type}
                        onChange={(e) => updateEditingField('property_type', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Multi-Family">Multi-Family</option>
                        <option value="Office">Office</option>
                        <option value="Retail">Retail</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Medical">Medical</option>
                        <option value="Student Housing">Student Housing</option>
                      </select>
                    ) : (
                      <div className="text-sm text-gray-500">{deal.property_type}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <input
                            type="number"
                            value={editingDeal.minimum_investment}
                            onChange={(e) => updateEditingField('minimum_investment', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <input
                            type="number"
                            value={editingDeal.target_irr}
                            onChange={(e) => updateEditingField('target_irr', parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          />
                          % IRR
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <input
                            type="number"
                            value={editingDeal.investment_term}
                            onChange={(e) => updateEditingField('investment_term', parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          />
                          years
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Min: ${deal.minimum_investment.toLocaleString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Target: {deal.target_irr}% IRR
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          Term: {deal.investment_term} years
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={editingDeal.status}
                        onChange={(e) => updateEditingField('status', e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          editingDeal.status === 'active'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : editingDeal.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    ) : (
                      <select
                        value={deal.status}
                        onChange={(e) => updateDealStatus(deal.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          deal.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : deal.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link 
                        to={`/deals/${deal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View deal"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveDeal}
                            disabled={saving}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Save changes"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel edit"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEditing(deal)}
                          className="text-gray-600 hover:text-blue-900"
                          title="Edit deal"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => updateDealStatus(deal.id, deal.status === 'archived' ? 'draft' : 'archived')}
                        className={`${deal.status === 'archived' ? 'text-green-600 hover:text-green-900' : 'text-gray-600 hover:text-gray-900'}`}
                        title={deal.status === 'archived' ? "Restore deal" : "Archive deal"}
                      >
                        <Archive className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}