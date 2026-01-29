import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Transporter } from '@/types';
import {
  TruckIcon,
  DollarIcon,
  PackageIcon,
  MapPinIcon,
  ClockIcon,
  CheckIcon,
  StarIcon,
  SnowflakeIcon,
} from '@/components/icons/Icons';

export const TransporterDashboard: React.FC = () => {
  const { currentUser } = useApp();
  const transporter = currentUser as Transporter;
  const [activeTab, setActiveTab] = useState('overview');
  const [isAvailable, setIsAvailable] = useState(true);

  const stats = [
    { label: 'Total Deliveries', value: '156', icon: PackageIcon, color: 'bg-orange-500' },
    { label: 'This Month', value: 'USD 78,500', icon: DollarIcon, color: 'bg-green-500' },
    { label: 'Active Jobs', value: '2', icon: TruckIcon, color: 'bg-blue-500' },
    { label: 'Rating', value: '4.8', icon: StarIcon, color: 'bg-yellow-500' },
  ];

  const availableJobs = [
    {
      id: 'JOB-001',
      pickup: 'Green Valley Farm, Nakuru',
      delivery: 'Fresh Foods Supermarket, Nairobi',
      distance: 156,
      items: 'Vegetables, Dairy',
      needsRefrigeration: true,
      estimatedPay: 850,
      pickupTime: '6:00 AM Tomorrow',
    },
    {
      id: 'JOB-002',
      pickup: 'Sunrise Orchards, Kiambu',
      delivery: 'Java House, Westlands',
      distance: 45,
      items: 'Fruits',
      needsRefrigeration: false,
      estimatedPay: 320,
      pickupTime: '8:00 AM Tomorrow',
    },
    {
      id: 'JOB-003',
      pickup: 'Highland Livestock, Nyandarua',
      delivery: 'Hilton Hotel, Nairobi',
      distance: 120,
      items: 'Beef, Poultry',
      needsRefrigeration: true,
      estimatedPay: 720,
      pickupTime: '5:00 AM Tomorrow',
    },
  ];

  const completedJobs = [
    { id: 'JOB-098', route: 'Nakuru → Nairobi', distance: 160, earnings: 880, date: '2024-01-28', rating: 5 },
    { id: 'JOB-097', route: 'Kiambu → Westlands', distance: 35, earnings: 280, date: '2024-01-27', rating: 5 },
    { id: 'JOB-096', route: 'Nyeri → Nairobi', distance: 145, earnings: 790, date: '2024-01-26', rating: 4 },
    { id: 'JOB-095', route: 'Thika → Industrial Area', distance: 42, earnings: 310, date: '2024-01-25', rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {transporter?.owner_name?.split(' ')[0] || 'Driver'}!
              </h1>
              <p className="text-gray-500">{transporter?.company_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <button
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    isAvailable ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      isAvailable ? 'left-8' : 'left-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                  {isAvailable ? 'Available' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vehicle Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Vehicle Information</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <TruckIcon className="text-orange-500" size={24} />
              <div>
                <p className="text-sm text-gray-500">Vehicle Type</p>
                <p className="font-medium">{transporter?.vehicle_type || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PackageIcon className="text-blue-500" size={24} />
              <div>
                <p className="text-sm text-gray-500">Capacity</p>
                <p className="font-medium">{transporter?.vehicle_capacity || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SnowflakeIcon className={transporter?.has_refrigeration ? 'text-blue-500' : 'text-gray-400'} size={24} />
              <div>
                <p className="text-sm text-gray-500">Refrigeration</p>
                <p className="font-medium">{transporter?.has_refrigeration ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarIcon className="text-green-500" size={24} />
              <div>
                <p className="text-sm text-gray-500">Rate</p>
                <p className="font-medium">USD {transporter?.per_km_rate || 2.5}/km</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {['available', 'active', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab} Jobs
            </button>
          ))}
        </div>

        {/* Available Jobs */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            {availableJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-sm text-gray-500">{job.id}</span>
                    <div className="flex items-center gap-2 mt-1">
                      {job.needsRefrigeration && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          <SnowflakeIcon size={12} />
                          Refrigerated
                        </span>
                      )}
                      <span className="text-sm text-gray-500">{job.items}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">USD {job.estimatedPay}</p>
                    <p className="text-sm text-gray-500">{job.distance} km</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5" />
                    <div>
                      <p className="text-sm text-gray-500">Pickup</p>
                      <p className="font-medium">{job.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5" />
                    <div>
                      <p className="text-sm text-gray-500">Delivery</p>
                      <p className="font-medium">{job.delivery}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ClockIcon size={16} />
                    <span>Pickup: {job.pickupTime}</span>
                  </div>
                  <button className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                    Accept Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Jobs */}
        {activeTab === 'active' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TruckIcon className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Jobs</h3>
            <p className="text-gray-500 mb-4">
              Accept a job from the available list to get started.
            </p>
            <button
              onClick={() => setActiveTab('available')}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              View Available Jobs
            </button>
          </div>
        )}

        {/* Completed Jobs */}
        {activeTab === 'completed' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {completedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{job.id}</td>
                    <td className="px-6 py-4 text-gray-600">{job.route}</td>
                    <td className="px-6 py-4 text-gray-600">{job.distance} km</td>
                    <td className="px-6 py-4 font-medium text-green-600">USD {job.earnings}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <StarIcon className="text-yellow-400" size={16} />
                        <span>{job.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{job.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
