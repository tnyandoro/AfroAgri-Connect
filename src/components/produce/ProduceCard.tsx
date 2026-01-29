import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ProduceListing } from '@/types';
import { PlusIcon, MinusIcon, LeafIcon, MapPinIcon } from '@/components/icons/Icons';

interface ProduceCardProps {
  produce: ProduceListing;
  onViewDetails?: (produce: ProduceListing) => void;
}

export const ProduceCard: React.FC<ProduceCardProps> = ({ produce, onViewDetails }) => {
  const { addToCart, cart, userRole } = useApp();
  const [quantity, setQuantity] = useState(produce.minimum_order || 1);
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = cart.find((item) => item.produce.id === produce.id);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(produce, quantity);
    setTimeout(() => setIsAdding(false), 500);
  };

  const incrementQuantity = () => {
    if (quantity < produce.quantity_available) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > (produce.minimum_order || 1)) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={produce.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'}
          alt={produce.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {produce.is_organic && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            <LeafIcon size={12} />
            Organic
          </div>
        )}
        {cartItem && (
          <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            In Cart: {cartItem.quantity}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{produce.name}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {produce.category?.name || 'Produce'}
          </span>
        </div>

        {produce.farmer && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <MapPinIcon size={14} />
            <span>{produce.farmer.farm_name}</span>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {produce.description || 'Fresh from the farm'}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold text-green-600">
              USD {produce.price_per_unit.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">/{produce.unit}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Available</p>
            <p className="font-medium text-gray-700">
              {produce.quantity_available.toLocaleString()} {produce.unit}
            </p>
          </div>
        </div>

        {userRole === 'market' && (
          <>
            {/* Quantity Selector */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Quantity:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={decrementQuantity}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <MinusIcon size={16} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <PlusIcon size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                isAdding
                  ? 'bg-green-600 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isAdding ? 'Added!' : `Add to Cart - USD ${(produce.price_per_unit * quantity).toFixed(2)}`}
            </button>
          </>
        )}

        {userRole !== 'market' && (
          <button
            onClick={() => onViewDetails?.(produce)}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};
