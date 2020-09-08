import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const products = await AsyncStorage.getItem('@GoMarketplace:products')

      if (products)
        setProducts(JSON.parse(products))
    }

    loadProducts();
  }, []);

  // async function saveProducts(arrProducts) {
  //   console.log(arrProducts.map(p => `${p.id} - ${p.quantity}`))
  //   setProducts(arrProducts)
  //   await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(arrProducts))
  // } 
  async function save(products: Array<Product>) {
    setProducts(products)
    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products))
  }


  const addToCart = useCallback(async product => {
    const productExists = products.find(p => p.id === product.id)

    const arrProducts = productExists
      ? products.map( p => p.id === product.id ? {...product, quantity: p.quantity + 1} : p)
      : [...products, {...product, quantity: 1}]

      save(arrProducts)
  }, [products]);


  const increment = useCallback(async id => {
    const arrProducts = products.map(product => product.id === id
      ? { ...product, quantity: product.quantity + 1 }
      : product
    )
    
    save(arrProducts)
  }, [products]);

  
  const decrement = useCallback(async id => {
    const arrProducts = products.reduce((acc, product) => {
      if (product.id === id) {
        if (product.quantity > 1) {
          product.quantity -= 1
          acc.push(product)
        }
      } else 
        acc.push(product)
      
      return acc
    }, [] as Array<Product>)

    save(arrProducts)
  }, [products]);


  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
