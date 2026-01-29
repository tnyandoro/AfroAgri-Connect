import React, { useState } from 'react';
import { signUp } from '@/lib/auth';
import { useApp } from '@/context/AppContext';
import { Transporter } from '@/types';
import { vehicleTypes } from '@/data/produceData';
import { CheckIcon, MapPinIcon, TruckIcon, SnowflakeIcon } from '@/components/icons/Icons';

interface TransporterRegistrationProps {
  onSuccess: () => void;
  onCancel: () => void;
  onSwitchToLogin?: () => void;
}

export const TransporterRegistration: React.FC<TransporterRegistrationProps> = ({
  onSuccess,
  onCancel,
  onSwitchToLogin,
}) => {
  const { setCurrentUser, setUserRole } = useApp();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    company_name: '',
    owner_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    vehicle_type: '',
    vehicle_capacity: '',
    has_refrigeration: false,
    license_plate: '',
    insurance_number: '',
    base_rate: 50,
    per_km_rate: 2.5,
    refrigeration_premium: 25,
    location_address: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
        role: 'transporter',
        profileData: {
          company_name: formData.company_name,
          owner_name: formData.owner_name,
          phone: formData.phone,
          vehicle_type: formData.vehicle_type,
          vehicle_capacity: formData.vehicle_capacity,
          has_refrigeration: formData.has_refrigeration,
          license_plate: formData.license_plate,
          insurance_number: formData.insurance_number,
          base_rate: formData.base_rate,
          per_km_rate: formData.per_km_rate,
          refrigeration_premium: formData.refrigeration_premium,
          location_address: formData.location_address,
        },
      });

      if (signUpError) {
        setError(signUpError);
        setIsSubmitting(false);
        return;
      }

      if (user) {
        setCurrentUser(user.profile as Transporter);
        setUserRole('transporter');
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.company_name && formData.owner_name && formData.email && formData.password && formData.confirmPassword && formData.phone;
  const isStep2Valid = formData.vehicle_type && formData.license_plate;

  return (
    <div className="p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= s
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > s ? <CheckIcon size={20} /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-16 h-1 mx-2 rounded ${
                  step > s ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Company Info & Account */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create Your Account
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company/Business Name *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="FastHaul Logistics"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner/Driver Name *
              </label>
              <input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="David Otieno"
                required
              />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="david@fasthaul.com"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="+254 712 345 678"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Location
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Industrial Area, Nairobi"
                />
              </div>
            </div>
            {onSwitchToLogin && (
              <p className="text-sm text-center text-gray-600 mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        )}

        {/* Step 2: Vehicle Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vehicle Details
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {vehicleTypes.map((vehicle) => (
                  <button
                    key={vehicle.type}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        vehicle_type: vehicle.type,
                        vehicle_capacity: vehicle.capacity,
                      }))
                    }
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.vehicle_type === vehicle.type
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TruckIcon
                        className={
                          formData.vehicle_type === vehicle.type
                            ? 'text-orange-500'
                            : 'text-gray-400'
                        }
                        size={24}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{vehicle.type}</p>
                        <p className="text-sm text-gray-500">
                          Capacity: {vehicle.capacity}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Plate Number *
              </label>
              <input
                type="text"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="KBZ 123A"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Number
              </label>
              <input
                type="text"
                name="insurance_number"
                value={formData.insurance_number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="INS-2024-XXXXX"
              />
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                name="has_refrigeration"
                id="has_refrigeration"
                checked={formData.has_refrigeration}
                onChange={handleInputChange}
                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
              />
              <label htmlFor="has_refrigeration" className="flex items-center gap-2">
                <SnowflakeIcon className="text-blue-500" size={20} />
                <span className="font-medium text-gray-900">
                  Vehicle has refrigeration
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Set Your Rates
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Set competitive rates to attract more customers. Prices are in USD.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Rate (per trip)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  USD
                </span>
                <input
                  type="number"
                  name="base_rate"
                  value={formData.base_rate}
                  onChange={handleInputChange}
                  min="0"
                  step="10"
                  className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Fixed charge for each delivery trip
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate per Kilometer
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  USD
                </span>
                <input
                  type="number"
                  name="per_km_rate"
                  value={formData.per_km_rate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Charged for each kilometer traveled
              </p>
            </div>
            {formData.has_refrigeration && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refrigeration Premium
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    USD
                  </span>
                  <input
                    type="number"
                    name="refrigeration_premium"
                    value={formData.refrigeration_premium}
                    onChange={handleInputChange}
                    min="0"
                    step="5"
                    className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Extra charge for refrigerated transport
                </p>
              </div>
            )}
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-gray-900 mb-2">Example Calculation</h4>
              <p className="text-sm text-gray-600">
                For a 50km trip{formData.has_refrigeration ? ' with refrigeration' : ''}:
              </p>
              <p className="text-lg font-bold text-orange-600 mt-1">
                USD{' '}
                {(
                  formData.base_rate +
                  formData.per_km_rate * 50 +
                  (formData.has_refrigeration ? formData.refrigeration_premium : 0)
                ).toFixed(2)}
              </p>
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
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
