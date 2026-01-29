import React from 'react';
import {
  WheatIcon,
  StoreIcon,
  TruckIcon,
  ArrowRightIcon,
  CheckIcon,
  LeafIcon,
  StarIcon,
  MapPinIcon,
} from '@/components/icons/Icons';

interface HomePageProps {
  onOpenAuth: (type: 'farmer' | 'market' | 'transporter') => void;
  onNavigate: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenAuth, onNavigate }) => {
  const stats = [
    { value: '2,500+', label: 'Active Farmers' },
    { value: '850+', label: 'Markets & Buyers' },
    { value: '150+', label: 'Transport Partners' },
    { value: '50,000+', label: 'Deliveries Made' },
  ];

  const categories = [
    { name: 'Crops', icon: WheatIcon, count: 45, color: 'bg-amber-500' },
    { name: 'Vegetables', icon: LeafIcon, count: 78, color: 'bg-green-500' },
    { name: 'Fruits', icon: LeafIcon, count: 56, color: 'bg-red-500' },
    { name: 'Dairy', icon: LeafIcon, count: 32, color: 'bg-blue-500' },
    { name: 'Livestock', icon: LeafIcon, count: 28, color: 'bg-orange-500' },
    { name: 'Flowers', icon: LeafIcon, count: 24, color: 'bg-pink-500' },
  ];

  const features = [
    {
      title: 'Direct Farm-to-Market',
      description: 'Connect directly with farmers and eliminate middlemen for fresher produce at better prices.',
      icon: WheatIcon,
    },
    {
      title: 'Verified Suppliers',
      description: 'All farmers are verified with certifications displayed for quality assurance.',
      icon: CheckIcon,
    },
    {
      title: 'Smart Logistics',
      description: 'Uber-style transport matching with real-time quotes based on distance and cargo type.',
      icon: TruckIcon,
    },
    {
      title: 'Bulk Ordering',
      description: 'Perfect for restaurants, hotels, supermarkets, and caterers with large volume needs.',
      icon: StoreIcon,
    },
  ];

  const testimonials = [
    {
      name: 'Grace Wanjiku',
      role: 'Restaurant Owner',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      text: 'FarmConnect has transformed how we source ingredients. Fresh produce delivered directly from farms at competitive prices.',
      rating: 5,
    },
    {
      name: 'Peter Kimani',
      role: 'Farmer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      text: 'Finally, a platform that lets me sell directly to buyers without going through expensive middlemen. My income has doubled!',
      rating: 5,
    },
    {
      name: 'David Otieno',
      role: 'Transport Partner',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      text: 'The smart matching system keeps my truck busy. I love the transparent pricing and reliable payments.',
      rating: 5,
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920"
            alt="Farm landscape"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-800/70" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-700/50 backdrop-blur px-4 py-2 rounded-full text-green-200 text-sm mb-6">
                <LeafIcon size={16} />
                <span>Connecting Farm to Table</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Fresh Produce,
                <br />
                <span className="text-green-400">Direct from Farms</span>
              </h1>
              <p className="text-lg text-green-100 mb-8 max-w-lg">
                The marketplace that connects farmers directly to markets, restaurants, and retailers with smart logistics solutions.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="px-8 py-4 bg-white text-green-800 rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center gap-2"
                >
                  Browse Marketplace
                  <ArrowRightIcon size={20} />
                </button>
                <button
                  onClick={() => onOpenAuth('farmer')}
                  className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-500 transition-colors border border-green-500"
                >
                  Join as Farmer
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-green-200 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Type Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join Our Growing Network
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you're a farmer looking to sell, a business needing fresh produce, or a transporter seeking opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Farmer Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <WheatIcon className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Farmers</h3>
              <p className="text-gray-600 mb-6">
                List your produce, set your prices, and reach thousands of buyers directly. No middlemen, better profits.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckIcon className="text-green-600" size={16} />
                  Free registration
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckIcon className="text-green-600" size={16} />
                  Set your own prices
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckIcon className="text-green-600" size={16} />
                  Direct buyer connections
                </li>
              </ul>
              <button
                onClick={() => onOpenAuth('farmer')}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Register as Farmer
              </button>
            </div>

            {/* Market Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <StoreIcon className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Markets & Buyers</h3>
              <p className="text-gray-600 mb-6">
                Source fresh produce directly from verified farmers. Perfect for restaurants, hotels, and retailers.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckIcon className="text-blue-600" size={16} />
                  Verified suppliers
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckIcon className="text-blue-600" size={16} />
                  Bulk ordering
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckIcon className="text-blue-600" size={16} />
                  Delivery included
                </li>
              </ul>
              <button
                onClick={() => onOpenAuth('market')}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Register as Buyer
              </button>
            </div>

            {/* Transporter Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <TruckIcon className="text-orange-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Transporters</h3>
              <p className="text-gray-600 mb-6">
                Join our logistics network and get matched with delivery jobs. Set your rates and grow your business.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckIcon className="text-orange-500" size={16} />
                  Smart job matching
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckIcon className="text-orange-500" size={16} />
                  Set your own rates
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckIcon className="text-orange-500" size={16} />
                  Reliable payments
                </li>
              </ul>
              <button
                onClick={() => onOpenAuth('transporter')}
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                Register as Transporter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse Categories</h2>
              <p className="text-gray-600">Find fresh produce across all categories</p>
            </div>
            <button
              onClick={() => onNavigate('marketplace')}
              className="hidden sm:flex items-center gap-2 text-green-600 font-semibold hover:text-green-700"
            >
              View All
              <ArrowRightIcon size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => onNavigate('marketplace')}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 group"
              >
                <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} products</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose FarmConnect?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing the agricultural supply chain with technology that benefits everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-gray-600">
              Join thousands of satisfied farmers, buyers, and transporters.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="text-yellow-400" size={18} />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Join FarmConnect today and be part of the agricultural revolution. Connect, trade, and grow together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-green-50 transition-colors"
            >
              Explore Marketplace
            </button>
            <button
              onClick={() => onOpenAuth('farmer')}
              className="px-8 py-4 bg-green-800 text-white rounded-xl font-semibold hover:bg-green-900 transition-colors"
            >
              Register Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
