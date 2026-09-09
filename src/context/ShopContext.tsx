"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string; // Unique ID for the cart item (product ID + size + silhouette)
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  silhouette: string;
  quantity: number;
}

export interface SavedItem {
  productId: string;
  name: string;
  price: number;
  image: string;
}

interface ShopContextType {
  cart: CartItem[];
  saved: SavedItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleSaved: (item: SavedItem) => void;
  isSaved: (productId: string) => boolean;
  cartTotal: number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  
  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pause_palette_cart');
    const savedWishlist = localStorage.getItem('pause_palette_saved');
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setSaved(JSON.parse(savedWishlist));
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem('pause_palette_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pause_palette_saved', JSON.stringify(saved));
  }, [saved]);

  const addToCart = (newItem: Omit<CartItem, 'id' | 'quantity'>) => {
    setCart(prevCart => {
      // Create a unique ID based on product variations
      const cartItemId = `${newItem.productId}-${newItem.size}-${newItem.silhouette}`;
      
      const existingItemIndex = prevCart.findIndex(item => item.id === cartItemId);
      
      if (existingItemIndex >= 0) {
        // Increment quantity if exact variant exists
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      } else {
        // Add new item
        return [...prevCart, { ...newItem, id: cartItemId, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prevCart => 
      prevCart.map(item => item.id === id ? { ...item, quantity } : item)
    );
  };

  const toggleSaved = (item: SavedItem) => {
    setSaved(prevSaved => {
      const exists = prevSaved.some(i => i.productId === item.productId);
      if (exists) {
        return prevSaved.filter(i => i.productId !== item.productId);
      } else {
        return [...prevSaved, item];
      }
    });
  };

  const isSaved = (productId: string) => {
    return saved.some(item => item.productId === productId);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <ShopContext.Provider value={{ 
      cart, 
      saved, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      toggleSaved, 
      isSaved,
      cartTotal
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
