import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Farmer } from '@/types';
import { sampleProduce } from '@/data/produceData';
import {
  PackageIcon,
  DollarIcon,
  TruckIcon,
  PlusIcon,
  StarIcon,
  MapPinIcon,
  CheckIcon,
  ClockIcon,
} from '@/components/icons/Icons';

export const FarmerDashboard: React.FC = () => {
  const { currentUser } = useApp();
  const farmer = currentUser as Farmer;
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data for the dashboard
  const stats = [
    { label: 'Active Listings', value: '12', icon: PackageIcon, color: 'bg-green-500' },
    { label: 'Total Revenue', value: 'KES 245,000', icon: DollarIcon, color: 'bg-blue-500' },
    { label: 'Pending Orders', value: '5', icon: ClockIcon, color: 'bg-orange-500' },
    { label: 'Completed Orders', value: '48', icon: CheckIcon, color: 'bg-purple-500' },
  ];

  const recentOrders = [
    { id: 'ORD-001', buyer: 'Fresh Foods Supermarket', items: 3, total: 15000, status: 'pending', date: '2024-01-28' },
    { id: 'ORD-002', buyer: 'Hilton Hotel', items: 5, total: 32000, status: 'confirmed', date: '2024-01-27' },
    { id: 'ORD-003', buyer: 'Mama Ngina School', items: 8, total: 28000, status: 'in_transit', date: '2024-01-26' },
    { id: 'ORD-004', buyer: 'Java House', items: 2, total: 8500, status: 'delivered', date: '2024-01-25' },
  ];

  const myListings = sampleProduce.slice(0, 6).map((p, i) => ({
    ...p,
    id: `listing-${i}`,
    views: Math.floor(50 + Math.random() * 200),
    orders: Math.floor(5 + Math.random() * 20),
  }));

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      in_transit: 'bg-orange-100 text-orange-700',
      delivered: 'bg-green-100 text-green-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {farmer?.name?.split(' ')[0] || 'Farmer'}!
              </h1>
              <p className="text-gray-500">{farmer?.farm_name}</p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
              <PlusIcon size={20} />
              Add Listing
            </button>
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

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {['overview', 'listings', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent Orders</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{order.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{order.buyer}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{order.items} items</span>
                      <span className="font-medium text-green-600">KES {order.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Farm Profile */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Farm Profile</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPinIcon className="text-gray-400" size={20} />
                  <span className="text-gray-600">{farmer?.location_address || 'Location not set'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <PackageIcon className="text-gray-400" size={20} />
                  <span className="text-gray-600">{farmer?.farm_size || 'Size not specified'}</span>
                </div>
                {farmer?.certifications && farmer.certifications.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {farmer.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <StarIcon className="text-yellow-400" size={20} />
                  <span className="font-medium">4.8</span>
                  <span className="text-gray-500">(124 reviews)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <img
                  src={listing.image}
                  alt={listing.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{listing.name}</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-green-600 font-medium mb-3">
                    KES {listing.price}/{listing.unit}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{listing.views} views</span>
                    <span>{listing.orders} orders</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-gray-600">{order.buyer}</td>
                    <td className="px-6 py-4 text-gray-600">{order.items}</td>
                    <td className="px-6 py-4 font-medium text-green-600">KES {order.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{order.date}</td>
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
