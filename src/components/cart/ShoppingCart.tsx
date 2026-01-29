import React from 'react';
import { useApp } from '@/context/AppContext';
import { XIcon, PlusIcon, MinusIcon, TruckIcon } from '@/components/icons/Icons';

interface ShoppingCartProps {
  onCheckout: () => void;
  onClose: () => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({ onCheckout, onClose }) => {
  const { cart, cartTotal, updateCartQuantity, removeFromCart, clearCart } = useApp();

  if (cart.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TruckIcon className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-4">
          Browse our marketplace and add fresh produce to your cart.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Shopping Cart ({cart.length} items)
          </h3>
          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cart.map((item) => (
          <div
            key={item.produce.id}
            className="flex gap-4 p-3 bg-gray-50 rounded-lg"
          >
            <img
              src={item.produce.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
              alt={item.produce.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{item.produce.name}</h4>
                  <p className="text-sm text-gray-500">
                    {item.produce.farmer?.farm_name || 'Local Farm'}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    USD {item.produce.price_per_unit.toFixed(2)}/{item.produce.unit}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.produce.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XIcon size={18} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateCartQuantity(item.produce.id, item.quantity - 1)
                    }
                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                  >
                    <MinusIcon size={14} />
                  </button>
                  <span className="w-10 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateCartQuantity(item.produce.id, item.quantity + 1)
                    }
                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                  >
                    <PlusIcon size={14} />
                  </button>
                </div>
                <span className="font-semibold text-gray-900">
                  USD {(item.produce.price_per_unit * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-xl font-bold text-gray-900">
            USD {cartTotal.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Transport costs will be calculated at checkout based on delivery distance.
        </p>
        <button
          onClick={onCheckout}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};
