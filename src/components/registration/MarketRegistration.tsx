import React, { useState } from 'react';
import { signUp } from '@/lib/auth';
import { useApp } from '@/context/AppContext';
import { Market } from '@/types';
import { marketTypes } from '@/data/produceData';
import { CheckIcon, MapPinIcon } from '@/components/icons/Icons';

interface MarketRegistrationProps {
  onSuccess: () => void;
  onCancel: () => void;
  onSwitchToLogin?: () => void;
}

export const MarketRegistration: React.FC<MarketRegistrationProps> = ({
  onSuccess,
  onCancel,
  onSwitchToLogin,
}) => {
  const { setCurrentUser, setUserRole } = useApp();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    contact_person: '',
    location_address: '',
    order_volume: '',
    delivery_preferences: [] as string[],
    description: '',
  });

  const deliveryOptions = [
    'Morning Delivery (6am-10am)',
    'Afternoon Delivery (12pm-4pm)',
    'Evening Delivery (5pm-8pm)',
    'Same Day Delivery',
    'Next Day Delivery',
    'Scheduled Weekly Delivery',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDeliveryPref = (pref: string) => {
    setFormData((prev) => ({
      ...prev,
      delivery_preferences: prev.delivery_preferences.includes(pref)
        ? prev.delivery_preferences.filter((p) => p !== pref)
        : [...prev.delivery_preferences, pref],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      const { user, error: signUpError } = await signUp({
        email: formData.email,
        password: formData.password,
        role: 'market',
        profileData: {
          business_name: formData.business_name,
          business_type: formData.business_type,
          phone: formData.phone,
          contact_person: formData.contact_person,
          location_address: formData.location_address,
          order_volume: formData.order_volume,
          delivery_preferences: formData.delivery_preferences,
          description: formData.description,
        },
      });

      if (signUpError) {
        setError(signUpError);
        setIsSubmitting(false);
        return;
      }

      if (user) {
        setCurrentUser(user.profile as Market);
        setUserRole('market');
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.business_name && formData.business_type && formData.email && formData.password && formData.confirmPassword;
  const isStep2Valid = formData.contact_person && formData.location_address;

  return (
    <div className="p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > s ? <CheckIcon size={20} /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-16 h-1 mx-2 rounded ${
                  step > s ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Business Info & Account */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create Your Account
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Fresh Foods Supermarket"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Type *
              </label>
              <select
                name="business_type"
                value={formData.business_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select business type</option>
                {marketTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="orders@freshfoods.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Create a password (min 6 characters)"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="+254 712 345 678"
              />
            </div>
            {onSwitchToLogin && (
              <p className="text-sm text-center text-gray-600 mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        )}

        {/* Step 2: Contact & Location */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact & Location
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Jane Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Address *
              </label>
              <div className="relative">
                <MapPinIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="location_address"
                  value={formData.location_address}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Westlands, Nairobi"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Typical Order Volume
              </label>
              <select
                name="order_volume"
                value={formData.order_volume}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select order volume</option>
                <option value="Small (Under 100kg/week)">Small (Under 100kg/week)</option>
                <option value="Medium (100-500kg/week)">Medium (100-500kg/week)</option>
                <option value="Large (500kg-2 tons/week)">Large (500kg-2 tons/week)</option>
                <option value="Bulk (Over 2 tons/week)">Bulk (Over 2 tons/week)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Your Business
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Tell farmers about your business needs..."
              />
            </div>
          </div>
        )}

        {/* Step 3: Delivery Preferences */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delivery Preferences
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select your preferred delivery times. This helps transporters plan routes.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {deliveryOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleDeliveryPref(option)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    formData.delivery_preferences.includes(option)
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.delivery_preferences.includes(option)
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {formData.delivery_preferences.includes(option) && (
                        <CheckIcon size={14} className="text-white" />
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
