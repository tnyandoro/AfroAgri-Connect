import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { Transporter, TransportQuote, Market } from '@/types';
import { TransportQuoteCard } from '@/components/transport/TransportQuoteCard';
import { MapPinIcon, CalendarIcon, ClockIcon, CheckIcon } from '@/components/icons/Icons';

interface CheckoutFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ onComplete, onBack }) => {
  const { cart, cartTotal, currentUser, clearCart, userRole } = useApp();
  const [step, setStep] = useState(1);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [quotes, setQuotes] = useState<TransportQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<TransportQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [deliveryDetails, setDeliveryDetails] = useState({
    delivery_address: (currentUser as Market)?.location_address || '',
    delivery_date: '',
    delivery_time: 'Morning (6am-10am)',
    notes: '',
  });

  // Simulated distance (in real app, would use Maps API)
  const [distance, setDistance] = useState(25);

  const needsRefrigeration = cart.some(
    (item) =>
      item.produce.category?.name === 'Dairy' ||
      item.produce.category?.name === 'Livestock'
  );

  useEffect(() => {
    fetchTransporters();
  }, []);

  const fetchTransporters = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transporters')
        .select('*')
        .eq('is_available', true);

      if (error) throw error;
      setTransporters(data || []);
    } catch (err) {
      console.error('Error fetching transporters:', err);
      // Use sample data if no transporters in DB
      setTransporters([
        {
          id: '1',
          company_name: 'FastHaul Logistics',
          owner_name: 'David Otieno',
          email: 'david@fasthaul.com',
          phone: '+254 756 789 012',
          vehicle_type: 'Refrigerated Truck',
          vehicle_capacity: '5 tons',
          has_refrigeration: true,
          base_rate: 80,
          per_km_rate: 3.5,
          refrigeration_premium: 30,
          is_available: true,
          rating: 4.8,
          total_deliveries: 342,
        },
        {
          id: '2',
          company_name: 'AgriMove Transport',
          owner_name: 'James Mutua',
          email: 'james@agrimove.com',
          phone: '+254 767 890 123',
          vehicle_type: 'Covered Truck',
          vehicle_capacity: '8 tons',
          has_refrigeration: false,
          base_rate: 60,
          per_km_rate: 2.8,
          refrigeration_premium: 0,
          is_available: true,
          rating: 4.6,
          total_deliveries: 521,
        },
        {
          id: '3',
          company_name: 'QuickFarm Delivery',
          owner_name: 'Mary Njeri',
          email: 'mary@quickfarm.com',
          phone: '+254 778 901 234',
          vehicle_type: 'Small Van',
          vehicle_capacity: '1.5 tons',
          has_refrigeration: true,
          base_rate: 40,
          per_km_rate: 2.0,
          refrigeration_premium: 20,
          is_available: true,
          rating: 4.9,
          total_deliveries: 189,
        },
      ] as Transporter[]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateQuotes = () => {
    const calculatedQuotes: TransportQuote[] = transporters
      .filter((t) => !needsRefrigeration || t.has_refrigeration)
      .map((transporter) => {
        const base_cost = transporter.base_rate;
        const distance_cost = transporter.per_km_rate * distance;
        const refrigeration_cost = needsRefrigeration
          ? transporter.refrigeration_premium
          : 0;
        const total_cost = base_cost + distance_cost + refrigeration_cost;

        // Estimate time based on distance (avg 40km/h in traffic)
        const hours = Math.ceil(distance / 40);
        const estimated_time = hours <= 1 ? '~1 hour' : `~${hours} hours`;

        return {
          transporter,
          distance_km: distance,
          base_cost,
          distance_cost,
          refrigeration_cost,
          total_cost,
          estimated_time,
        };
      })
      .sort((a, b) => a.total_cost - b.total_cost);

    setQuotes(calculatedQuotes);
    if (calculatedQuotes.length > 0) {
      setSelectedQuote(calculatedQuotes[0]);
    }
  };

  useEffect(() => {
    if (transporters.length > 0 && step === 2) {
      calculateQuotes();
    }
  }, [transporters, step, distance]);

  const handleSubmitOrder = async () => {
    if (!selectedQuote) return;

    setIsSubmitting(true);
    try {
      // In a real app, this would create the order in the database
      // For now, we'll simulate success
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setOrderSuccess(true);
      setTimeout(() => {
        clearCart();
        onComplete();
      }, 2000);
    } catch (err) {
      console.error('Error submitting order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryTimeOptions = [
    'Morning (6am-10am)',
    'Midday (10am-2pm)',
    'Afternoon (2pm-6pm)',
    'Evening (6pm-9pm)',
  ];

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (orderSuccess) {
    return (
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckIcon className="text-green-600" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-600 mb-4">
          Your order has been sent to the farmer. You'll receive a confirmation shortly.
        </p>
        <p className="text-sm text-gray-500">
          Transport: {selectedQuote?.transporter.company_name}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= s
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > s ? <CheckIcon size={20} /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-16 h-1 mx-2 rounded ${
                  step > s ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Delivery Details */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Delivery Details
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address *
            </label>
            <div className="relative">
              <MapPinIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={deliveryDetails.delivery_address}
                onChange={(e) =>
                  setDeliveryDetails((prev) => ({
                    ...prev,
                    delivery_address: e.target.value,
                  }))
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter delivery address"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date *
              </label>
              <div className="relative">
                <CalendarIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="date"
                  value={deliveryDetails.delivery_date}
                  min={minDate}
                  onChange={(e) =>
                    setDeliveryDetails((prev) => ({
                      ...prev,
                      delivery_date: e.target.value,
                    }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Time
              </label>
              <div className="relative">
                <ClockIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  value={deliveryDetails.delivery_time}
                  onChange={(e) =>
                    setDeliveryDetails((prev) => ({
                      ...prev,
                      delivery_time: e.target.value,
                    }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                >
                  {deliveryTimeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Distance (km)
            </label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(parseInt(e.target.value) || 0)}
              min="1"
              max="500"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter approximate distance from farm to your location
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Instructions
            </label>
            <textarea
              value={deliveryDetails.notes}
              onChange={(e) =>
                setDeliveryDetails((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Any special delivery instructions..."
            />
          </div>
        </div>
      )}

      {/* Step 2: Select Transport */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Select Transport
          </h3>
          {needsRefrigeration && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 mb-4">
              Your order contains perishable items. Only refrigerated transport options are shown.
            </div>
          )}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Finding available transporters...</p>
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transporters available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quotes.map((quote) => (
                <TransportQuoteCard
                  key={quote.transporter.id}
                  quote={quote}
                  isSelected={selectedQuote?.transporter.id === quote.transporter.id}
                  onSelect={() => setSelectedQuote(quote)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 3 && selectedQuote && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Review Your Order
          </h3>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.produce.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600">
                    {item.produce.name} x {item.quantity} {item.produce.unit}
                  </span>
                  <span className="font-medium">
                    KES {(item.produce.price_per_unit * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Delivery</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPinIcon className="text-gray-400 mt-0.5" size={16} />
                <span className="text-gray-600">{deliveryDetails.delivery_address}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-gray-400" size={16} />
                <span className="text-gray-600">
                  {new Date(deliveryDetails.delivery_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="text-gray-400" size={16} />
                <span className="text-gray-600">{deliveryDetails.delivery_time}</span>
              </div>
            </div>
          </div>

          {/* Transport Info */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Transport</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedQuote.transporter.company_name}</p>
                <p className="text-sm text-gray-500">
                  {selectedQuote.transporter.vehicle_type} • {selectedQuote.distance_km}km
                </p>
              </div>
              <p className="text-lg font-bold text-orange-600">
                KES {selectedQuote.total_cost.toFixed(0)}
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>KES {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Transport</span>
              <span>KES {selectedQuote.total_cost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-green-600">
                KES {(cartTotal + selectedQuote.total_cost).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={step === 1 ? onBack : () => setStep(step - 1)}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          {step === 1 ? 'Back to Cart' : 'Back'}
        </button>
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={
              step === 1
                ? !deliveryDetails.delivery_address || !deliveryDetails.delivery_date
                : !selectedQuote
            }
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>
        )}
      </div>
    </div>
  );
};
