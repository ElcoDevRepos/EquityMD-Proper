import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { MapPin, Building, Calendar, TrendingUp, DollarSign, Users, FileText, ChevronRight, AlertCircle, Globe, Briefcase, MessageCircle, Wallet, Play, Info } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MessageModal } from '../components/MessageModal';
import { DealMediaGallery } from '../components/DealMediaGallery';
import { VideoEmbed } from '../components/VideoEmbed';
import { AuthModal } from '../components/AuthModal';
import { FavoriteButton } from '../components/FavoriteButton';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { getSyndicatorLogo } from '../lib/syndicator-logos';
import { Tooltip } from 'react-tooltip';
import type { Deal, DealFile } from '../types/database';
import { ReturnsCalculator } from '../components/ReturnsCalculator';

interface DealMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description: string;
  order: number;
}

interface DealWithSyndicator extends Deal {
  syndicator?: {
    company_name: string;
    company_logo_url: string | null;
    years_in_business: number | null;
    company_description: string | null;
    website_url: string | null;
    total_deal_volume: number | null;
  };
}

export function DealDetails() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const [deal, setDeal] = useState<DealWithSyndicator | null>(null);
  const [files, setFiles] = useState<DealFile[]>([]);
  const [media, setMedia] = useState<DealMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [investmentRequests, setInvestmentRequests] = useState({
    count: 0,
    loading: true
  });

  useEffect(() => {
    fetchDealDetails();
  }, [slug]);

  async function fetchInvestmentRequestCount(dealId: string) {
    try {
      // Check if investment_requests table exists first
      const { count, error } = await supabase
        .from('investment_requests')
        .select('*', { count: 'exact', head: true })
        .eq('deal_id', dealId);

      if (error) {
        // If table doesn't exist, just set count to 0
        console.log('Investment requests table not found yet:', error);
        setInvestmentRequests({
          count: 0,
          loading: false
        });
        return;
      }

      setInvestmentRequests({
        count: count || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching investment request count:', error);
      setInvestmentRequests({
        count: 0,
        loading: false
      });
    }
  }

  async function fetchDealDetails() {
    try {
      // Find deal by slug (title converted to slug)
      if (!slug) {
        setLoading(false);
        return;
      }
      
      const title = slug.split('-').join(' ');

      console.log('Fetching deal with title:', title);

      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select(`
          *,
          syndicator:syndicator_id (
            company_name,
            company_logo_url,
            years_in_business,
            company_description,
            website_url,
            total_deal_volume
          )
        `)
        .ilike('title', title)
        .single();

        console.log('Fetched deal data:', dealData);

      if (dealError || !dealData) {
        console.error('Error fetching deal:', dealError);
        
        // Check if this is a mock deal (BackBay, Starboard, or Sutera) and provide mock data
        const mockPriorityDeals = [
          {
            id: 'backbay-1',
            syndicator_id: 'back-bay-capital',
            title: 'San Diego Multi-Family Offering',
            location: 'San Diego, CA',
            property_type: 'Multi-Family',
            status: 'active' as const,
            target_irr: 15,
            minimum_investment: 500000,
            investment_term: 5,
            description: 'Back Bay Investment Group presents an opportunity to invest in a fund focused on multifamily development and value-add projects in Southern California. Leveraging the region\'s robust economy, diverse job market, and housing demand, the fund aims to capitalize on the region\'s housing shortage while delivering superior risk-adjusted returns.',
            address: { street: '', city: 'San Diego', state: 'CA', zip: '' },
            investment_highlights: ['Access to Institutional Grade Assets', 'Prime Residential Markets', 'Tax Deductions & Bonus Depreciation Benefits', 'Target 75% Cash on Cash', '15% Target Investor IRR', '1.75x Target Equity Multiple'],
            total_equity: 10000000,
            featured: true,
            cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_SanDeigo.jpg',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            slug: 'san-diego-multi-family-offering',
            syndicator: {
              company_name: 'Back Bay Capital',
              company_logo_url: null,
              years_in_business: 10,
              company_description: 'Back Bay Investment Group specializes in real estate development and value-add projects across Southern California.',
              website_url: null,
              total_deal_volume: 30000000
            }
          },
          {
            id: 'backbay-2',
            syndicator_id: 'back-bay-capital',
            title: 'Newport Beach Residential Offering',
            location: 'Newport Beach, CA',
            property_type: 'Residential',
            status: 'active' as const,
            target_irr: 20,
            minimum_investment: 250000,
            investment_term: 2,
            description: 'Back Bay Investment Group is offering an exclusive opportunity to invest in residential real estate in Newport Beach and surrounding coastal communities, targeting high-demand neighborhoods with limited inventory and strong growth potential.',
            address: { street: '', city: 'Newport Beach', state: 'CA', zip: '' },
            investment_highlights: ['Short Term Investment', 'Value-Add Strategy', 'Multiple Exit Options', 'Target 60% Cash on Cash', '20% Target Investor IRR', '1.6x Target Equity Multiple'],
            total_equity: 10000000,
            featured: true,
            cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_Newport.jpg',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            slug: 'newport-beach-residential-offering',
            syndicator: {
              company_name: 'Back Bay Capital',
              company_logo_url: null,
              years_in_business: 10,
              company_description: 'Back Bay Investment Group specializes in real estate development and value-add projects across Southern California.',
              website_url: null,
              total_deal_volume: 30000000
            }
          },
          {
            id: 'backbay-3',
            syndicator_id: 'back-bay-capital',
            title: 'Orange County Pref Equity Offering',
            location: 'Newport Beach, CA',
            property_type: 'Preferred Equity',
            status: 'active' as const,
            target_irr: 15,
            minimum_investment: 100000,
            investment_term: 2,
            description: 'Back Bay Investment Group is offering a preferred equity investment with a fixed 15% annual return, paid quarterly, and a targeted holding period of 1–3 years. Designed for investors seeking secure, predictable income, this offering provides priority in the capital stack above common equity.',
            address: { street: '', city: 'Newport Beach', state: 'CA', zip: '' },
            investment_highlights: ['Quarterly Payments', 'Fixed 15% Return', 'Priority in the Equity Stack', 'Target 45% Cash on Cash', '15% Target Investor IRR', '1.45x Target Equity Multiple'],
            total_equity: 10000000,
            featured: true,
            cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_OrangeCounty.jpg',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            slug: 'orange-county-pref-equity-offering',
            syndicator: {
              company_name: 'Back Bay Capital',
              company_logo_url: null,
              years_in_business: 10,
              company_description: 'Back Bay Investment Group specializes in real estate development and value-add projects across Southern California.',
              website_url: null,
              total_deal_volume: 30000000
            }
          },
          {
            id: 'sutera-1',
            syndicator_id: 'sutera-properties',
            title: 'Greenville Apartment Complex',
            location: 'Travelers Rest, SC',
            property_type: 'Multi-Family',
            status: 'active' as const,
            target_irr: 17.19,
            minimum_investment: 50000,
            investment_term: 5,
            description: `Project Overview:
Sutera Properties presents Liva, a ground-up multifamily development in Travelers Rest, South Carolina, a rapidly growing suburb of Greenville. The project spans 10.5 acres and includes 120 multifamily units and 32 individually platted townhomes, totaling 152 units. The site is 100% shovel-ready with Land Disturbance Permits secured as of March 2025.

Investment Highlights:
• Updated Business Plan: The multifamily portion will be held as a rental property with a projected un-trended Yield on Cost of 7.19% (up from 6.8%), while townhomes will be sold to individual buyers, responding to strong local demand.
• Cost Efficiency: Reduced per-unit basis for the multifamily to $205k (from $250k), compared to recent market comps like The Standard at Pinestone, which received bids at $230k/unit in 2024.
• Prime Location: Located near the Swamp Rabbit Trail and half a mile from Travelers Rest's Main Street, with planned streetscape improvements enhancing connectivity.
• Market Dynamics: Travelers Rest is experiencing 3.43% annual population growth, with zero projected multifamily deliveries in the North Greenville submarket, positioning Liva to capitalize on strong demand.

Financial Snapshot:
• Total Project Cost: $38,226,500
• Equity Raise: $12,340,000
• Construction LTV: 65%
• Estimated Hold Period: 5 years

Amenities & Design:
Liva promotes an active lifestyle with resort-style amenities including a pool, clubhouse, fitness center, fire pit, dog park, bike barn, and a multi-use path connecting to the Main Street corridor. Units feature spacious, open floor plans tailored to the unique fabric of Travelers Rest.

Why Invest?
Backed by Sutera Properties' expertise, Liva offers a flexible exit strategy, strong risk-adjusted returns, and a prime position in a high-growth market. With construction set to begin upon capitalization, this is a timely opportunity to invest in the thriving Upstate South Carolina region.`,
            address: { street: '', city: 'Travelers Rest', state: 'SC', zip: '' },
            investment_highlights: [
              'Ground-up development',
              '152 total units (120 multifamily + 32 townhomes)',
              'Resort-style amenities',
              'Pool and clubhouse',
              'Fitness center',
              'Dog park and bike barn',
              'Prime location near Swamp Rabbit Trail',
              'Shovel-ready with permits secured'
            ],
            total_equity: 12340000,
            featured: true,
            cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0980.jpeg',
        media_urls: [
          // Actual images that exist in liva_2025 folder (IMG_0980 to IMG_0986)
          'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0980.jpeg',
          'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0981.jpeg',
          'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0982.jpeg',
          'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0983.jpeg',
          'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0984.jpeg',
          'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0985.jpeg',
          'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0986.jpeg'
        ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            slug: 'greenville-apartment-complex',
            syndicator: {
              company_name: 'Sutera Properties',
              company_logo_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/syndicatorlogos/suteraproperties.png',
              years_in_business: 8,
              company_description: 'Sutera is an emerging Multifamily Investment & Property Management firm based in Nashville, Tennessee focused on Value-Add Acquisitions and Management, primarily in the Southeast.',
              website_url: null,
              total_deal_volume: 15000000
            }
          },
          {
            id: 'starboard-2',
            syndicator_id: 'starboard-realty',
            title: 'Multifamily ADU Opportunity',
            location: 'Southern California',
            property_type: 'Multi-Family',
            status: 'active' as const,
            target_irr: 30,
            minimum_investment: 50000,
            investment_term: 3,
            description: 'Starboard Realty Advisors is offering investors the opportunity to invest in the high-demand multifamily markets of Southern California. With a growing pipeline of opportunities, the Fund will be opportunistically deploying capital to acquire small multifamily buildings with the intent of maximizing revenue growth through renovations and the addition of units by leveraging California\'s recent Accessory Dwelling Unit (ADU) legislation. The Fund intends to strategically acquire multifamily opportunities with targeted property level IRRs of 30%+ and equity multiples of 1.60X – 1.90X+ over a 2-3 year investment horizon. The Fund plans to leverage economies of scale through unique relationships with highly skilled vendors to minimize acquisition, materials, labor, and operational costs. The Fund further hopes to potentially enhance returns to investors through cost segregation and accelerated depreciation strategies.',
            address: { street: '', city: 'Southern California', state: 'CA', zip: '' },
            investment_highlights: ['30%+ Target Property IRR', '1.60X - 1.90X+ Equity Multiple', '2-3 Year Investment Horizon', 'ADU Legislation Leverage', 'Economies of Scale', 'Cost Segregation & Tax Benefits'],
            total_equity: 5000000,
            featured: true,
            cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//adu.png',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            slug: 'multifamily-adu-opportunity',
            syndicator: {
              company_name: 'Starboard Realty',
              company_logo_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/logos//Starboard_reality.jpg',
              years_in_business: 10,
              company_description: 'Starboard Realty Advisors is a privately held, fully-integrated real estate firm specializing in multifamily and commercial properties.',
              website_url: 'https://starboard-realty.com/',
              total_deal_volume: 608000000
            }
          }
        ];

        // Find matching mock deal
        const mockDeal = mockPriorityDeals.find(deal => deal.slug === slug);
        if (mockDeal) {
          setDeal(mockDeal);
          
          // Convert media_urls to DealMedia format for mock deals
          if (mockDeal.media_urls && mockDeal.media_urls.length > 0) {
            const mockMedia: DealMedia[] = mockDeal.media_urls.map((url, index) => ({
              id: `mock-media-${index}`,
              type: 'image' as const,
              url: url,
              title: `Image ${index + 1}`,
              description: `Property image ${index + 1}`,
              order: index
            }));
            setMedia(mockMedia);
          }
          
          // Add mock files for specific deals
          if (mockDeal.slug === 'multifamily-adu-opportunity') {
            setFiles([
              {
                id: 'adu-brochure-1',
                deal_id: mockDeal.id,
                file_name: 'Starboard Southern California Multifamily ADU Opportunity Fund I LLC - Brochure',
                file_type: 'PDF',
                file_size: 2458000, // ~2.5MB
                file_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/propertydocs//Starboard%20Southern%20California%20Multifamily%20ADU%20Opportunity%20Fund%20I%20LLC%20-%20Brochure%20(Final)%20(1).pdf',
                is_private: false,
                created_at: new Date().toISOString()
              }
            ]);
          }
        } else {
          return;
        }
      } else {
        setDeal(dealData);
      }

      // Fetch deal files
      const { data: fileData, error: fileError } = await supabase
        .from('deal_files')
        .select('*')
        .eq('deal_id', dealData.id)
        .eq('is_private', false);

      if (fileError) throw fileError;
      setFiles(fileData || []);

      // Fetch deal media
      const { data: mediaData, error: mediaError } = await supabase
        .from('deal_media')
        .select('*')
        .eq('deal_id', dealData.id)
        .order('order', { ascending: true });

      if (mediaError) throw mediaError;
      setMedia(mediaData || []);

      // Fetch investment request count for this deal
      await fetchInvestmentRequestCount(dealData.id);

    } catch (error) {
      console.error('Error fetching deal details:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = (action: 'invest' | 'contact') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (action === 'invest') {
      setShowInvestModal(true);
    } else {
      setShowMessageModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading deal details...</div>
      </div>
    );
  }

  if (!deal) {
    return <Navigate to="/404" />;
  }

  // Remove progress percentage calculation as we're now tracking requests, not funding
  const syndicatorSlug = deal.syndicator?.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div className="min-h-screen bg-gray-50">
      <head>
        <title>Invest in Top CRE Deals | EquityMD</title>
        <meta name="description" content="Explore CRE deals with active investment requests on EquityMD. Connect with verified syndicators and join accredited investors in commercial real estate opportunities." />
        <meta name="keywords" content="CRE investment, commercial real estate deals, accredited investors, investment requests, real estate syndication" />
      </head>
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[400px]">
        <img
          src={deal.cover_image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'}
          alt={deal.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 text-white">
            <div className="flex items-center text-sm mb-4">
              <span>Deals</span>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span>{deal.property_type}</span>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span>{deal.title}</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{deal.title}</h1>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{deal.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery Section (keep at top) */}
            {media.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Property Gallery</h2>
                <DealMediaGallery media={media} />
              </div>
            )}

            {/* Video Section (keep at top, if present) */}
            {deal.syndicator?.company_name === 'Sutera Properties' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Property Overview</h2>
                <VideoEmbed 
                  url="https://www.youtube.com/watch?v=GM7zriIRpbg"
                  title="Property Overview"
                  className="mb-4"
                />
                <p className="text-sm text-gray-500">
                  Take a virtual tour of this investment opportunity.
                </p>
              </div>
            )}

            {/* Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">Investment Overview</h2>
              <p className="text-gray-600 mb-6">{deal.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-gray-500 text-sm mb-1">Property Type</div>
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">{deal.property_type}</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm mb-1">Investment Term</div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">{deal.investment_term} years</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm mb-1">Target IRR</div>
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">{deal.target_irr}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Highlights */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">Investment Highlights</h2>
              <ul className="space-y-4">
                {deal.investment_highlights?.map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                    </div>
                    <span className="ml-3 text-gray-600">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">Documents</h2>
              <div className="space-y-4">
                {files.map((file) => (
                  <a
                    key={file.id}
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <FileText className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium">{file.file_name}</div>
                      <div className="text-sm text-gray-500">{file.file_type}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Returns Calculator directly after Documents */}
            <div className="max-w-2xl mx-auto px-4">
              <ReturnsCalculator />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-8 h-fit">
            {/* Investment Interest */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-bold">Investment Interest</h3>
                <Info 
                  className="h-4 w-4 text-gray-400 ml-2 cursor-help" 
                  data-tooltip-id="interest-tooltip"
                />
                <Tooltip 
                  id="interest-tooltip"
                  content="Number of investors requesting to invest in this deal"
                  place="top"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-gray-600">Investment Requests</span>
                  </div>
                  {investmentRequests.loading ? (
                    <Skeleton height={24} width={32} />
                  ) : (
                    <span className="font-bold text-2xl text-blue-600">
                      {investmentRequests.count}+
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between py-4 border-b">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-500">Minimum Investment</span>
                  </div>
                  <span className="font-medium">${deal.minimum_investment.toLocaleString()}</span>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-800">
                    <strong>Active Interest:</strong> This deal has received {investmentRequests.loading ? '...' : investmentRequests.count} investment requests from accredited investors.
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <button 
                  onClick={() => handleAction('invest')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Invest Now
                </button>

                <button 
                  onClick={() => handleAction('contact')}
                  className="w-full bg-white text-blue-600 border-2 border-blue-600 py-3 rounded-lg hover:bg-blue-50 transition flex items-center justify-center"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Syndicator
                </button>

                <FavoriteButton 
                  dealId={deal.id} 
                  className="w-full py-3"
                />
              </div>
            </div>

            {/* Accredited Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <div className="text-sm text-yellow-700">
                  This investment opportunity is only available to accredited investors.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMessageModal && deal && (
        <MessageModal
          dealId={deal.id}
          dealTitle={deal.title}
          syndicatorId={deal.syndicator_id}
          syndicatorName={deal.syndicator?.company_name || 'Syndicator'}
          onClose={() => setShowMessageModal(false)}
        />
      )}

      {showInvestModal && deal && (
        <MessageModal
          dealId={deal.id}
          dealTitle={deal.title}
          syndicatorId={deal.syndicator_id}
          syndicatorName={deal.syndicator?.company_name || 'Syndicator'}
          onClose={() => setShowInvestModal(false)}
          isInvestment
        />
      )}

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          defaultType="investor"
        />
      )}

      <Footer />
    </div>
  );
}