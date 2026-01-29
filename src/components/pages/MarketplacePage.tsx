import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ProduceListing, ProduceCategory } from '@/types';
import { ProduceCard } from '@/components/produce/ProduceCard';
import { sampleProduce } from '@/data/produceData';
import {
  SearchIcon,
  FilterIcon,
  ChevronDownIcon,
  WheatIcon,
  LeafIcon,
  AppleIcon,
  MilkIcon,
  BeefIcon,
  FlowerIcon,
  XIcon,
} from '@/components/icons/Icons';

const categoryIcons: Record<string, React.FC<{ className?: string; size?: number }>> = {
  Crops: WheatIcon,
  Vegetables: LeafIcon,
  Fruits: AppleIcon,
  Dairy: MilkIcon,
  Livestock: BeefIcon,
  Flowers: FlowerIcon,
};

export const MarketplacePage: React.FC = () => {
  const { userRole } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [showOrganic, setShowOrganic] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Convert sample data to ProduceListing format
  const allProduce: ProduceListing[] = useMemo(() => {
    return sampleProduce.map((item, index) => ({
      id: `produce-${index}`,
      farmer_id: `farmer-${index % 4}`,
      category_id: `cat-${item.category}`,
      name: item.name,
      description: item.description,
      price_per_unit: item.price,
      unit: item.unit,
      quantity_available: item.quantity,
      minimum_order: 1,
      is_organic: item.isOrganic,
      is_seasonal: false,
      image_url: item.image,
      is_active: true,
      category: { id: `cat-${item.category}`, name: item.category },
      farmer: {
        id: `farmer-${index % 4}`,
        name: ['John Mwangi', 'Sarah Ochieng', 'Peter Kimani', 'Grace Wanjiku'][index % 4],
        email: 'farmer@example.com',
        farm_name: ['Green Valley Farm', 'Sunrise Orchards', 'Highland Livestock', 'Dairy Dreams'][index % 4],
      },
    }));
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(sampleProduce.map((p) => p.category))];
    return cats.map((name) => ({
      id: `cat-${name}`,
      name,
      count: sampleProduce.filter((p) => p.category === name).length,
    }));
  }, []);

  // Filter and sort produce
  const filteredProduce = useMemo(() => {
    let result = [...allProduce];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => p.category?.name === selectedCategory);
    }

    // Price filter
    result = result.filter(
      (p) => p.price_per_unit >= priceRange[0] && p.price_per_unit <= priceRange[1]
    );

    // Organic filter
    if (showOrganic) {
      result = result.filter((p) => p.is_organic);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price_per_unit - b.price_per_unit);
        break;
      case 'price-high':
        result.sort((a, b) => b.price_per_unit - a.price_per_unit);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'quantity':
        result.sort((a, b) => b.quantity_available - a.quantity_available);
        break;
    }

    return result;
  }, [allProduce, searchQuery, selectedCategory, priceRange, showOrganic, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
          <p className="text-gray-600">
            Browse fresh produce from verified local farmers
          </p>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search produce, farms, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="quantity">Availability</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 border rounded-xl flex items-center gap-2 transition-colors ${
                  showFilters
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FilterIcon size={20} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (KES)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Min"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value) || 500])
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organic Only
                  </label>
                  <button
                    onClick={() => setShowOrganic(!showOrganic)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      showOrganic
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {showOrganic ? 'Organic Only' : 'All Products'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Categories */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between transition-colors ${
                    !selectedCategory
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>All Products</span>
                  <span className="text-sm text-gray-400">{allProduce.length}</span>
                </button>
                {categories.map((category) => {
                  const Icon = categoryIcons[category.name] || LeafIcon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between transition-colors ${
                        selectedCategory === category.name
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={18} />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-sm text-gray-400">{category.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Active Filters */}
            {(selectedCategory || showOrganic || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-gray-500">Active filters:</span>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {selectedCategory}
                    <XIcon size={14} />
                  </button>
                )}
                {showOrganic && (
                  <button
                    onClick={() => setShowOrganic(false)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    Organic
                    <XIcon size={14} />
                  </button>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    "{searchQuery}"
                    <XIcon size={14} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setShowOrganic(false);
                    setSearchQuery('');
                    setPriceRange([0, 500]);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredProduce.length}</span> products
              </p>
            </div>

            {/* Products */}
            {filteredProduce.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setShowOrganic(false);
                    setSearchQuery('');
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProduce.map((produce) => (
                  <ProduceCard key={produce.id} produce={produce} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
