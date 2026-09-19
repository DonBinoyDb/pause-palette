"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  clearData: () => void;
  cartTotal: number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { data: session, status } = useSession();
  const router = useRouter();

  // Load from local storage initially
  useEffect(() => {
    const savedCart = localStorage.getItem('pause_palette_cart');
    const savedWishlist = localStorage.getItem('pause_palette_saved');
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setSaved(JSON.parse(savedWishlist));
    
    setIsInitialized(true);
  }, []);

  // Sync with DB if logged in
  useEffect(() => {
    if (status === 'authenticated' && isInitialized) {
      const syncWithDb = async () => {
        try {
          // Execute any pending actions (like adding to cart post-login)
          const pendingActionStr = localStorage.getItem('pending_action');
          if (pendingActionStr) {
            const pendingAction = JSON.parse(pendingActionStr);
            if (pendingAction.type === 'add_to_cart') {
              await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  productId: pendingAction.item.productId,
                  size: pendingAction.item.size,
                  silhouette: pendingAction.item.silhouette,
                  quantity: 1
                })
              });
              localStorage.removeItem('pending_action');
              router.push('/cart');
            } else if (pendingAction.type === 'add_to_wishlist') {
              await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: pendingAction.item.productId })
              });
              localStorage.removeItem('pending_action');
              router.push('/saved');
            }
          }

          // 1. If we have local items, push them to DB first (Merge)
          if (cart.length > 0) {
            await fetch('/api/cart', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: cart })
            });
          }
          if (saved.length > 0) {
            await fetch('/api/wishlist', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: saved })
            });
          }

          // 2. Fetch the combined true state from DB
          const cartRes = await fetch('/api/cart');
          if (cartRes.ok) {
            const dbCart = await cartRes.json();
            setCart(dbCart);
            localStorage.setItem('pause_palette_cart', JSON.stringify(dbCart));
          }

          const savedRes = await fetch('/api/wishlist');
          if (savedRes.ok) {
            const dbSaved = await savedRes.json();
            setSaved(dbSaved);
            localStorage.setItem('pause_palette_saved', JSON.stringify(dbSaved));
          }
        } catch (error) {
          console.error("Failed to sync with DB", error);
        }
      };
      
      syncWithDb();
    }
  }, [status, isInitialized]); // We run this once when auth status becomes known

  // Save to local storage on changes (always keeping local up to date)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('pause_palette_cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('pause_palette_saved', JSON.stringify(saved));
    }
  }, [saved, isInitialized]);

  const addToCart = async (newItem: Omit<CartItem, 'id' | 'quantity'>) => {
    if (status === 'unauthenticated') {
      localStorage.setItem('pending_action', JSON.stringify({
        type: 'add_to_cart',
        item: newItem
      }));
      router.push('/login');
      return;
    }

    const cartItemId = `${newItem.productId}-${newItem.size}-${newItem.silhouette}`;
    
    let newQuantity = 1;
    
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === cartItemId);
      if (existingItemIndex >= 0) {
        const newCart = [...prevCart];
        newQuantity = newCart[existingItemIndex].quantity + 1;
        newCart[existingItemIndex].quantity = newQuantity;
        return newCart;
      } else {
        return [...prevCart, { ...newItem, id: cartItemId, quantity: 1 }];
      }
    });

    if (status === 'authenticated') {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: newItem.productId,
            size: newItem.size,
            silhouette: newItem.silhouette,
            quantity: newQuantity
          })
        });
      } catch (error) {
        console.error("Failed to update cart in DB", error);
      }
    }
  };

  const removeFromCart = async (id: string) => {
    const itemToRemove = cart.find(item => item.id === id);
    setCart(prevCart => prevCart.filter(item => item.id !== id));

    if (status === 'authenticated' && itemToRemove) {
      try {
        await fetch(`/api/cart?productId=${itemToRemove.productId}&size=${itemToRemove.size}&silhouette=${itemToRemove.silhouette}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error("Failed to delete cart item in DB", error);
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => item.id === id ? { ...item, quantity } : item)
    );

    if (status === 'authenticated') {
      const itemToUpdate = cart.find(item => item.id === id);
      if (itemToUpdate) {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: itemToUpdate.productId,
              size: itemToUpdate.size,
              silhouette: itemToUpdate.silhouette,
              quantity: quantity
            })
          });
        } catch (error) {
          console.error("Failed to update cart quantity in DB", error);
        }
      }
    }
  };

  const toggleSaved = async (item: SavedItem) => {
    if (status === 'unauthenticated') {
      localStorage.setItem('pending_action', JSON.stringify({
        type: 'add_to_wishlist',
        item: item
      }));
      router.push('/login');
      return;
    }

    setSaved(prevSaved => {
      const exists = prevSaved.some(i => i.productId === item.productId);
      if (exists) {
        return prevSaved.filter(i => i.productId !== item.productId);
      } else {
        return [...prevSaved, item];
      }
    });

    if (status === 'authenticated') {
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: item.productId })
        });
      } catch (error) {
        console.error("Failed to toggle wishlist item in DB", error);
      }
    }
  };

  const isSaved = (productId: string) => {
    return saved.some(item => item.productId === productId);
  };

  const clearData = () => {
    setCart([]);
    setSaved([]);
    localStorage.removeItem('pause_palette_cart');
    localStorage.removeItem('pause_palette_saved');
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
      clearData,
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
