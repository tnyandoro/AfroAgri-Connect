import React, { useState, useMemo } from 'react';
import { sampleTransporters } from '@/data/produceData';
import {
  SearchIcon,
  TruckIcon,
  SnowflakeIcon,
  StarIcon,
  PhoneIcon,
  MapPinIcon,
  DollarIcon,
  PackageIcon,
} from '@/components/icons/Icons';

interface TransportPageProps {
  onOpenAuth: (type: 'farmer' | 'market' | 'transporter') => void;
}

export const TransportPage: React.FC<TransportPageProps> = ({ onOpenAuth }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null);
  const [showRefrigeratedOnly, setShowRefrigeratedOnly] = useState(false);

  // Extended transporter data
  const transporters = useMemo(() => {
    return [
      ...sampleTransporters,
      {
        company_name: 'CoolChain Logistics',
        owner_name: 'Elizabeth Akinyi',
        email: 'elizabeth@coolchain.com',
        phone: '+254 790 123 456',
        vehicle_type: 'Refrigerated Truck',
        vehicle_capacity: '8 tons',
        has_refrigeration: true,
        base_rate: 100,
        per_km_rate: 4.0,
        refrigeration_premium: 35,
        is_available: true,
        rating: 4.7,
        total_deliveries: 256,
        location_address: 'Mombasa Road, Nairobi',
      },
      {
        company_name: 'Swift Farm Movers',
        owner_name: 'Robert Kariuki',
        email: 'robert@swiftfarm.com',
        phone: '+254 701 234 567',
        vehicle_type: 'Small Van',
        vehicle_capacity: '2 tons',
        has_refrigeration: false,
        base_rate: 35,
        per_km_rate: 1.8,
        refrigeration_premium: 0,
        is_available: true,
        rating: 4.4,
        total_deliveries: 423,
        location_address: 'Thika, Kenya',
      },
      {
        company_name: 'Heavy Haul Kenya',
        owner_name: 'Patrick Omondi',
        email: 'patrick@heavyhaul.com',
        phone: '+254 712 345 678',
        vehicle_type: 'Flatbed Truck',
        vehicle_capacity: '15 tons',
        has_refrigeration: false,
        base_rate: 120,
        per_km_rate: 5.0,
        refrigeration_premium: 0,
        is_available: true,
        rating: 4.6,
        total_deliveries: 312,
        location_address: 'Industrial Area, Nairobi',
      },
      {
        company_name: 'Fresh Express',
        owner_name: 'Nancy Wambui',
        email: 'nancy@freshexpress.com',
        phone: '+254 723 456 789',
        vehicle_type: 'Refrigerated Truck',
        vehicle_capacity: '3 tons',
        has_refrigeration: true,
        base_rate: 55,
        per_km_rate: 2.5,
        refrigeration_premium: 20,
        is_available: true,
        rating: 4.9,
        total_deliveries: 567,
        location_address: 'Westlands, Nairobi',
      },
    ].map((t, index) => ({
      ...t,
      id: `transporter-${index}`,
    }));
  }, []);

  const vehicleTypes = useMemo(() => {
    return [...new Set(transporters.map((t) => t.vehicle_type))];
  }, [transporters]);

  const filteredTransporters = useMemo(() => {
    let result = [...transporters];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.company_name.toLowerCase().includes(query) ||
          t.owner_name.toLowerCase().includes(query) ||
          t.vehicle_type.toLowerCase().includes(query)
      );
    }

    if (selectedVehicleType) {
      result = result.filter((t) => t.vehicle_type === selectedVehicleType);
    }

    if (showRefrigeratedOnly) {
      result = result.filter((t) => t.has_refrigeration);
    }

    return result.sort((a, b) => b.rating - a.rating);
  }, [transporters, searchQuery, selectedVehicleType, showRefrigeratedOnly]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-2">Transport Partners</h1>
          <p className="text-orange-100 max-w-2xl">
            Reliable transport solutions for your agricultural produce. Choose from our network of verified transporters.
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
                placeholder="Search by company, driver, or vehicle type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedVehicleType(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedVehicleType
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All Vehicles
            </button>
            {vehicleTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedVehicleType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedVehicleType === type
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowRefrigeratedOnly(!showRefrigeratedOnly)}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${
              showRefrigeratedOnly
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <SnowflakeIcon size={16} />
            Refrigerated Only
          </button>
        </div>

        {/* Results */}
        <p className="text-gray-600 mb-6">
          Showing <span className="font-semibold">{filteredTransporters.length}</span> transporters
        </p>

        {/* Transporters Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTransporters.map((transporter) => (
            <div
              key={transporter.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      transporter.has_refrigeration ? 'bg-blue-100' : 'bg-orange-100'
                    }`}
                  >
                    {transporter.has_refrigeration ? (
                      <SnowflakeIcon
                        className="text-blue-600"
                        size={32}
                      />
                    ) : (
                      <TruckIcon
                        className="text-orange-500"
                        size={32}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {transporter.company_name}
                        </h3>
                        <p className="text-sm text-gray-500">{transporter.owner_name}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <StarIcon className="text-yellow-500" size={14} />
                        <span className="font-medium text-sm">
                          {transporter.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <TruckIcon size={14} />
                        {transporter.vehicle_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <PackageIcon size={14} />
                        {transporter.vehicle_capacity}
                      </span>
                      {transporter.has_refrigeration && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <SnowflakeIcon size={14} />
                          Refrigerated
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Pricing</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Base Rate</p>
                      <p className="font-semibold text-gray-900">
                        KES {transporter.base_rate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Per KM</p>
                      <p className="font-semibold text-gray-900">
                        KES {transporter.per_km_rate}
                      </p>
                    </div>
                    {transporter.has_refrigeration && (
                      <div>
                        <p className="text-xs text-gray-500">Refrigeration</p>
                        <p className="font-semibold text-gray-900">
                          +KES {transporter.refrigeration_premium}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{transporter.total_deliveries} deliveries</span>
                    {transporter.location_address && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon size={14} />
                        {transporter.location_address}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${transporter.phone}`}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <PhoneIcon className="text-gray-600" size={20} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Availability Badge */}
              <div
                className={`px-6 py-3 text-center text-sm font-medium ${
                  transporter.is_available
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {transporter.is_available ? 'Available Now' : 'Currently Busy'}
              </div>
            </div>
          ))}
        </div>

        {filteredTransporters.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TruckIcon className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No transporters found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Become a Transport Partner</h2>
          <p className="text-orange-100 mb-6 max-w-xl mx-auto">
            Have a truck or van? Join our network and start earning by delivering fresh produce across Kenya.
          </p>
          <button
            onClick={() => onOpenAuth('transporter')}
            className="px-8 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors"
          >
            Register as Transporter
          </button>
        </div>
      </div>
    </div>
  );
};
