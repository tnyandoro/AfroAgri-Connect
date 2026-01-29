import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Market } from '@/types';
import {
  PackageIcon,
  DollarIcon,
  TruckIcon,
  CartIcon,
  StarIcon,
  MapPinIcon,
  CheckIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@/components/icons/Icons';

interface MarketDashboardProps {
  onNavigate: (view: string) => void;
}

export const MarketDashboard: React.FC<MarketDashboardProps> = ({ onNavigate }) => {
  const { currentUser, cart, cartTotal } = useApp();
  const market = currentUser as Market;
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Total Orders', value: '32', icon: PackageIcon, color: 'bg-blue-500' },
    { label: 'Total Spent', value: 'USD 485,000', icon: DollarIcon, color: 'bg-green-500' },
    { label: 'Active Deliveries', value: '3', icon: TruckIcon, color: 'bg-orange-500' },
    { label: 'Saved Farms', value: '8', icon: StarIcon, color: 'bg-purple-500' },
  ];

  const recentOrders = [
    { id: 'ORD-032', farm: 'Green Valley Farm', items: 4, total: 18500, status: 'delivered', date: '2024-01-28' },
    { id: 'ORD-031', farm: 'Sunrise Orchards', items: 6, total: 24000, status: 'in_transit', date: '2024-01-27' },
    { id: 'ORD-030', farm: 'Highland Livestock', items: 2, total: 45000, status: 'confirmed', date: '2024-01-26' },
    { id: 'ORD-029', farm: 'Dairy Dreams', items: 5, total: 12000, status: 'delivered', date: '2024-01-25' },
  ];

  const favoriteFarms = [
    { name: 'Green Valley Farm', location: 'Nakuru', rating: 4.9, orders: 12, image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=100' },
    { name: 'Sunrise Orchards', location: 'Kiambu', rating: 4.8, orders: 8, image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=100' },
    { name: 'Dairy Dreams', location: 'Nyeri', rating: 4.7, orders: 6, image: 'https://images.unsplash.com/photo-1527847263472-aa5338d178b8?w=100' },
  ];

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
                Welcome, {market?.contact_person?.split(' ')[0] || market?.business_name || 'Buyer'}!
              </h1>
              <p className="text-gray-500">{market?.business_name} • {market?.business_type}</p>
            </div>
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CartIcon size={20} />
              Browse Products
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cart Banner */}
        {cart.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CartIcon size={24} />
              </div>
              <div>
                <p className="font-medium">You have {cart.length} items in your cart</p>
                <p className="text-green-100 text-sm">Total: USD {cartTotal.toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('checkout')}
              className="px-6 py-2 bg-white text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center gap-2"
            >
              Checkout
              <ArrowRightIcon size={18} />
            </button>
          </div>
        )}

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
          {['overview', 'orders', 'favorites'].map((tab) => (
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
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {recentOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{order.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{order.farm}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{order.items} items</span>
                      <span className="font-medium text-green-600">USD {order.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Favorite Farms */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Favorite Farms</h2>
                <button
                  onClick={() => onNavigate('farmers')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse All
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {favoriteFarms.map((farm, index) => (
                  <div key={index} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                    <img
                      src={farm.image}
                      alt={farm.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{farm.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPinIcon size={14} />
                        <span>{farm.location}</span>
                        <span>•</span>
                        <StarIcon className="text-yellow-400" size={14} />
                        <span>{farm.rating}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{farm.orders} orders</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farm</th>
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
                    <td className="px-6 py-4 text-gray-600">{order.farm}</td>
                    <td className="px-6 py-4 text-gray-600">{order.items}</td>
                    <td className="px-6 py-4 font-medium text-green-600">USD {order.total.toLocaleString()}</td>
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

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteFarms.map((farm, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <img
                  src={farm.image}
                  alt={farm.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{farm.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPinIcon size={14} />
                    <span>{farm.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <StarIcon className="text-yellow-400" size={16} />
                      <span className="font-medium">{farm.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">{farm.orders} orders</span>
                  </div>
                  <button
                    onClick={() => onNavigate('marketplace')}
                    className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Products
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
