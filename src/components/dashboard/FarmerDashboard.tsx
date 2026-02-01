import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Farmer, ProduceListing } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
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

interface ProduceFormValues {
  name: string;
  categoryId: string;
  pricePerUnit: string;
  quantityAvailable: string;
  unit: string;
  description: string;
  isOrganic: boolean;
}

const CATEGORY_OPTIONS = [
  { id: 'crops', label: 'Crops' },
  { id: 'livestock', label: 'Livestock' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'flowers', label: 'Flowers' },
];

const UNIT_OPTIONS = ['kg', 'ton', 'liter', 'crate', 'dozen', 'bag', 'unit'];

export const FarmerDashboard: React.FC = () => {
  const { currentUser } = useApp();
  const farmer = currentUser as Farmer;
  const [activeTab, setActiveTab] = useState('overview');
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingListing, setEditingListing] = useState<ProduceListing | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formValues, setFormValues] = useState<ProduceFormValues>({
    name: '',
    categoryId: '',
    pricePerUnit: '',
    quantityAvailable: '',
    unit: '',
    description: '',
    isOrganic: false,
  });

  useEffect(() => {
    if (!farmer?.id) return;

    const fetchListings = async () => {
      setIsLoadingListings(true);
      try {
        const { data, error } = await supabase
          .from('produce_listings')
          .select('*')
          .eq('farmer_id', farmer.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading produce listings:', error);
          toast({
            title: 'Error loading listings',
            description: error.message,
          });
          return;
        }

        setListings((data as ProduceListing[]) || []);
      } finally {
        setIsLoadingListings(false);
      }
    };

    fetchListings();
  }, [farmer?.id]);

  const resetForm = () => {
    setFormValues({
      name: '',
      categoryId: '',
      pricePerUnit: '',
      quantityAvailable: '',
      unit: '',
      description: '',
      isOrganic: false,
    });
    setImageFile(null);
    setEditingListing(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleEditListing = (listing: ProduceListing) => {
    setActiveTab('listings');
    setEditingListing(listing);
    setFormValues({
      name: listing.name || '',
      categoryId: listing.category_id || '',
      pricePerUnit:
        typeof listing.price_per_unit === 'number'
          ? listing.price_per_unit.toString()
          : '',
      quantityAvailable:
        typeof listing.quantity_available === 'number'
          ? listing.quantity_available.toString()
          : '',
      unit: listing.unit || '',
      description: listing.description || '',
      isOrganic: listing.is_organic ?? false,
    });
    setImageFile(null);
  };

  const handleDeleteListing = async (listing: ProduceListing) => {
    if (!farmer?.id) return;
    const confirmed = window.confirm('Are you sure you want to delete this listing?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('produce_listings')
        .delete()
        .eq('id', listing.id)
        .eq('farmer_id', farmer.id);

      if (error) {
        throw error;
      }

      setListings((prev) => prev.filter((item) => item.id !== listing.id));
      toast({
        title: 'Listing deleted',
        description: 'Your produce listing has been removed.',
      });
    } catch (err) {
      console.error('Error deleting listing:', err);
      toast({
        title: 'Error deleting listing',
        description:
          err instanceof Error ? err.message : 'Something went wrong.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmer?.id) return;

    if (!formValues.name || !formValues.categoryId || !formValues.unit) {
      toast({
        title: 'Missing information',
        description: 'Please fill in name, category, and unit.',
      });
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl: string | null = editingListing?.image_url ?? null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop() || 'jpg';
        const fileName = `${farmer.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('produce-images')
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) {
          console.warn('Image upload failed, saving listing without image:', uploadError);
          toast({
            title: 'Listing saved without image',
            description: 'Image upload failed. You can edit the listing later to add a photo.',
            variant: 'default',
          });
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('produce-images')
            .getPublicUrl(fileName);
          imageUrl = publicUrlData?.publicUrl ?? null;
        }
      }

      const payload = {
        farmer_id: farmer.id,
        name: formValues.name.trim(),
        description: (formValues.description?.trim() || null) as string | null,
        category_id: formValues.categoryId,
        price_per_unit: Math.max(0, Number(formValues.pricePerUnit) || 0),
        unit: formValues.unit,
        quantity_available: Math.max(0, Number(formValues.quantityAvailable) || 0),
        minimum_order: 1,
        is_organic: Boolean(formValues.isOrganic),
        is_seasonal: false,
        is_active: true,
        image_url: imageUrl,
      };

      if (editingListing) {
        const { data, error } = await supabase
          .from('produce_listings')
          .update(payload)
          .eq('id', editingListing.id)
          .eq('farmer_id', farmer.id)
          .select('*')
          .single();

        if (error) {
          toast({
            title: 'Error updating listing',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }

        setListings((prev) =>
          prev.map((item) =>
            item.id === editingListing.id ? (data as ProduceListing) : item,
          ),
        );

        toast({
          title: 'Listing updated',
          description: 'Your produce listing has been updated.',
        });
      } else {
        const { data, error } = await supabase
          .from('produce_listings')
          .insert(payload)
          .select('*')
          .single();

        if (error) {
          toast({
            title: 'Error creating listing',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }

        setListings((prev) => [data as ProduceListing, ...prev]);

        toast({
          title: 'Listing created',
          description: 'Your produce listing has been created.',
        });
      }

      resetForm();
    } catch (err) {
      console.error('Error saving listing:', err);
      const message = err instanceof Error ? err.message : 'Something went wrong. Check the console for details.';
      toast({
        title: 'Error saving listing',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Sample data for the dashboard
  const stats = [
    { label: 'Active Listings', value: '12', icon: PackageIcon, color: 'bg-green-500' },
    { label: 'Total Revenue', value: 'USD 245,000', icon: DollarIcon, color: 'bg-blue-500' },
    { label: 'Pending Orders', value: '5', icon: ClockIcon, color: 'bg-orange-500' },
    { label: 'Completed Orders', value: '48', icon: CheckIcon, color: 'bg-purple-500' },
  ];

  const recentOrders = [
    { id: 'ORD-001', buyer: 'Fresh Foods Supermarket', items: 3, total: 15000, status: 'pending', date: '2024-01-28' },
    { id: 'ORD-002', buyer: 'Hilton Hotel', items: 5, total: 32000, status: 'confirmed', date: '2024-01-27' },
    { id: 'ORD-003', buyer: 'Mama Ngina School', items: 8, total: 28000, status: 'in_transit', date: '2024-01-26' },
    { id: 'ORD-004', buyer: 'Java House', items: 2, total: 8500, status: 'delivered', date: '2024-01-25' },
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
                Welcome back, {farmer?.name?.split(' ')[0] || 'Farmer'}!
              </h1>
              <p className="text-gray-500">{farmer?.farm_name}</p>
            </div>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              onClick={() => {
                setActiveTab('listings');
                resetForm();
              }}
            >
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
                      <span className="font-medium text-green-600">USD {order.total.toLocaleString()}</span>
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
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)] gap-6">
            {/* Listing Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                {editingListing ? 'Edit Listing' : 'Add New Listing'}
              </h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="e.g. Organic Tomatoes"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="categoryId"
                      value={formValues.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                      required
                    >
                      <option value="">Select category</option>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formValues.unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                      required
                    >
                      <option value="">Select unit</option>
                      {UNIT_OPTIONS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per unit (USD) *
                    </label>
                    <input
                      type="number"
                      name="pricePerUnit"
                      min="0"
                      step="0.01"
                      value={formValues.pricePerUnit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="e.g. 25"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity available *
                    </label>
                    <input
                      type="number"
                      name="quantityAvailable"
                      min="0"
                      step="1"
                      value={formValues.quantityAvailable}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="e.g. 1000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formValues.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                    placeholder="Briefly describe your produce (quality, variety, etc.)"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="isOrganic"
                      checked={formValues.isOrganic}
                      onChange={handleCheckboxChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Organic produce
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional. Upload a clear photo of this product.
                  </p>
                  {editingListing?.image_url && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current image will be kept unless you upload a new one.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : editingListing ? (
                      'Save Changes'
                    ) : (
                      <>
                        <PlusIcon size={16} />
                        Create Listing
                      </>
                    )}
                  </button>
                  {editingListing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Listings Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">My Listings</h2>
                {isLoadingListings && (
                  <span className="text-sm text-gray-500">Loading...</span>
                )}
              </div>

              {listings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                  You have no listings yet. Use the form to create your first
                  produce listing.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <img
                        src={
                          listing.image_url ||
                          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'
                        }
                        alt={listing.name}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {listing.name}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              listing.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {listing.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">
                          {listing.quantity_available} {listing.unit} available
                        </p>
                        <p className="text-green-600 font-medium mb-3">
                          USD {listing.price_per_unit?.toFixed(2)}/{listing.unit}
                        </p>
                        {listing.description && (
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                            {listing.description}
                          </p>
                        )}
                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditListing(listing)}
                            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteListing(listing)}
                            className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
      </div>
    </div>
  );
};
