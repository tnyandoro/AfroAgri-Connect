import React from 'react';
import { TransportQuote } from '@/types';
import { TruckIcon, SnowflakeIcon, StarIcon, ClockIcon, MapPinIcon } from '@/components/icons/Icons';

interface TransportQuoteCardProps {
  quote: TransportQuote;
  isSelected: boolean;
  onSelect: () => void;
}

export const TransportQuoteCard: React.FC<TransportQuoteCardProps> = ({
  quote,
  isSelected,
  onSelect,
}) => {
  const { transporter } = quote;

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-orange-500 bg-orange-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Vehicle Icon */}
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            isSelected ? 'bg-orange-500' : 'bg-gray-100'
          }`}
        >
          <TruckIcon
            className={isSelected ? 'text-white' : 'text-gray-500'}
            size={28}
          />
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">
                {transporter.company_name}
              </h4>
              <p className="text-sm text-gray-500">{transporter.vehicle_type}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">
                KES {quote.total_cost.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">Total cost</p>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <StarIcon className="text-yellow-500" size={14} />
              <span>{transporter.rating.toFixed(1)}</span>
              <span className="text-gray-400">
                ({transporter.total_deliveries} trips)
              </span>
            </div>
            {transporter.has_refrigeration && (
              <div className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                <SnowflakeIcon size={14} />
                <span>Refrigerated</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <ClockIcon size={14} />
              <span>{quote.estimated_time}</span>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-gray-500">Base Rate</p>
                <p className="font-medium">KES {quote.base_cost.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-gray-500">Distance ({quote.distance_km}km)</p>
                <p className="font-medium">KES {quote.distance_cost.toFixed(0)}</p>
              </div>
              {quote.refrigeration_cost > 0 && (
                <div>
                  <p className="text-gray-500">Refrigeration</p>
                  <p className="font-medium">KES {quote.refrigeration_cost.toFixed(0)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-orange-200">
          <div className="flex items-center gap-2 text-sm text-orange-700">
            <MapPinIcon size={16} />
            <span>
              {transporter.location_address || 'Available in your area'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
