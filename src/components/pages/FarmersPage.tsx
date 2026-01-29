import React, { useState, useMemo } from 'react';
import { sampleFarmers } from '@/data/produceData';
import {
  SearchIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  StarIcon,
  CheckIcon,
  LeafIcon,
} from '@/components/icons/Icons';

interface FarmersPageProps {
  onNavigate: (view: string) => void;
}

export const FarmersPage: React.FC<FarmersPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCertification, setSelectedCertification] = useState<string | null>(null);

  // Extended farmer data
  const farmers = useMemo(() => {
    return [
      ...sampleFarmers,
      {
        name: 'Munyaradzi Oduya',
        farm_name: 'Savanna Grains',
        email: 'munyaradzi@savannagrains.com',
        phone: '+263 756 789 012',
        location_address: 'Murehwa, Zimbabwe',
        farm_size: '200 acres',
        certifications: ['GlobalGAP', 'Organic Certified'],
        description: 'Large-scale grain production with modern farming techniques.',
      },
      {
        name: 'Alice Muthoni',
        farm_name: 'Bloom Gardens',
        email: 'alice@bloomgardens.com',
        phone: '+263 767 890 123',
        location_address: 'Chikore, Nyanga, Zimbabwe',
        farm_size: '15 acres',
        certifications: ['Fair Trade'],
        description: 'Premium flower cultivation for local and export markets.',
      },
      {
        name: 'Elphas Wekesa',
        farm_name: 'Valley Fresh Produce',
        email: 'elphas@valleyfresh.com',
        phone: '+263 778 901 234',
        location_address: 'Wedza Marondera, Zimbabwe',
        farm_size: '80 acres',
        certifications: ['Organic Certified', 'Quality Assured'],
        description: 'Mixed farming with vegetables, fruits, and dairy.',
      },
      {
        name: 'Shawn Dohwe',
        farm_name: 'Coastal Harvest',
        email: 'shawn@coastalharvest.com',
        phone: '+263 789 012 345',
        location_address: 'Kilifi County, Zimbabwe',
        farm_size: '25 acres',
        certifications: ['Rainforest Alliance'],
        description: 'Tropical fruits and coconut products from the coast.',
      },
    ].map((farmer, index) => ({
      ...farmer,
      id: `farmer-${index}`,
      rating: 4.5 + Math.random() * 0.5,
      totalOrders: Math.floor(100 + Math.random() * 500),
      productsCount: Math.floor(5 + Math.random() * 15),
      image: `https://images.unsplash.com/photo-${
        [
          '1507003211169-0a1dd7228f2d',
          '1494790108377-be9c29b29330',
          '1472099645785-5658abf4ff4e',
          '1438761681033-6461ffad8d80',
          '1500648767791-00dcc994a43e',
          '1534528741775-53994a69daeb',
          '1506794778202-cad84cf45f1d',
          '1544005313-94ddf0286df2',
        ][index % 8]
      }?w=200`,
    }));
  }, []);

  const allCertifications = useMemo(() => {
    const certs = new Set<string>();
    farmers.forEach((f) => f.certifications?.forEach((c) => certs.add(c)));
    return Array.from(certs);
  }, [farmers]);

  const filteredFarmers = useMemo(() => {
    let result = [...farmers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.farm_name.toLowerCase().includes(query) ||
          f.location_address?.toLowerCase().includes(query)
      );
    }

    if (selectedCertification) {
      result = result.filter((f) =>
        f.certifications?.includes(selectedCertification)
      );
    }

    return result;
  }, [farmers, searchQuery, selectedCertification]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-2">Our Farmers</h1>
          <p className="text-green-100 max-w-2xl">
            Connect with verified local farmers and source fresh produce directly from the source.
          </p>

          {/* Search */}
          <div className="mt-6 max-w-xl">
            <div className="relative">
              <SearchIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search farmers by name, farm, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Certification Filters */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Certification</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCertification(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCertification
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All Farmers
            </button>
            {allCertifications.map((cert) => (
              <button
                key={cert}
                onClick={() => setSelectedCertification(cert)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCertification === cert
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {cert}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <p className="text-gray-600 mb-6">
          Showing <span className="font-semibold">{filteredFarmers.length}</span> farmers
        </p>

        {/* Farmers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarmers.map((farmer) => (
            <div
              key={farmer.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header with image */}
              <div className="relative h-32 bg-gradient-to-r from-green-600 to-green-700">
                <img
                  src={farmer.image}
                  alt={farmer.name}
                  className="absolute bottom-0 left-6 translate-y-1/2 w-20 h-20 rounded-xl object-cover border-4 border-white shadow-lg"
                />
              </div>

              {/* Content */}
              <div className="pt-12 p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {farmer.farm_name}
                    </h3>
                    <p className="text-sm text-gray-500">{farmer.name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <StarIcon className="text-yellow-400" size={16} />
                    <span className="font-medium">{farmer.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                  <MapPinIcon size={14} />
                  <span>{farmer.location_address}</span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {farmer.description}
                </p>

                {/* Certifications */}
                {farmer.certifications && farmer.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {farmer.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium"
                      >
                        <LeafIcon size={12} />
                        {cert}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>{farmer.farm_size}</span>
                  <span>•</span>
                  <span>{farmer.productsCount} products</span>
                  <span>•</span>
                  <span>{farmer.totalOrders} orders</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigate('marketplace')}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    View Products
                  </button>
                  <a
                    href={`tel:${farmer.phone}`}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PhoneIcon className="text-gray-600" size={20} />
                  </a>
                  <a
                    href={`mailto:${farmer.email}`}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MailIcon className="text-gray-600" size={20} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFarmers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No farmers found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
