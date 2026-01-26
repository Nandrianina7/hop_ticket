// components/FoodStep.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { axiosInstance } from '../../../utils/api';
import axios from 'axios';

interface FoodStepProps {
  foodItems: any[];
  setFoodItems: (items: any[]) => void;
  theme: any;
}

interface RestaurantItem {
  id: number;
  name: string;
  description: string;
  category: string;
  category_name: string;
  price: number;
  image: string | null;
  is_available: boolean;
  stock: number;
}
interface RestaurantItemCategory {
  id: number;
  category_name: string;
}

const FoodStep: React.FC<FoodStepProps> = ({ foodItems, setFoodItems, theme }) => {
  const [menuItems, setMenuItems] = useState<RestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuItemsCategory, setMenuItemsCategory] = useState<RestaurantItemCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fetchConcenssionCategories = async () => {
      try {
      
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BACK_URL}/cinema/restaurantitem/categories/`);

        if (!response.data) {
          console.log('Server not responding');
          return;
        }
  
        console.log('Categories fetched successfully:', response.data);
        setMenuItemsCategory(response.data.data || []);
      } catch (error) {
        console.log('Failed to load categories from server', error);
      }
    };

  useEffect(() => {
    fetchRestaurantItems();
    fetchConcenssionCategories();
  }, []);

  const getCategoryOrder = () => {
  const order = new Map<string, number>();
  menuItemsCategory.forEach((c, idx) => order.set(c.category_name, idx));
  return order;
};

// Optional: label from backend (fallback to original)
const getCategoryLabel = (categoryName: string) => {
  // Use DB-provided name directly
  return categoryName || 'Autres';
};

  const fetchRestaurantItems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/cinema/restaurant-items/');
      console.log('Restaurant items from API:', response.data);
      setMenuItems(response.data);
    } catch (err: any) {
      console.error('Error fetching restaurant items:', err);
      setError('Erreur lors du chargement du menu');
    } finally {
      setLoading(false);
    }
  };

  const addItem = (restaurantItem: RestaurantItem) => {
    if (!restaurantItem.is_available) {
      return;
    }

    const existingItemIndex = foodItems.findIndex(i => i.item === restaurantItem.id);
    
    if (existingItemIndex > -1) {
      // Augmenter la quantité si l'article existe déjà
      const updatedItems = [...foodItems];
      updatedItems[existingItemIndex].quantity += 1;
      setFoodItems(updatedItems);
    } else {
      // Ajouter un nouvel article avec quantité 1
      setFoodItems([...foodItems, { 
        item: restaurantItem.id,
        name: restaurantItem.name,
        quantity: 1,
        price: restaurantItem.price,
        price_at_time: restaurantItem.price
      }]);
    }
  };

  const removeItem = (itemId: number) => {
    const existingItemIndex = foodItems.findIndex(i => i.item === itemId);
    
    if (existingItemIndex > -1) {
      const updatedItems = [...foodItems];
      
      if (updatedItems[existingItemIndex].quantity > 1) {
        // Réduire la quantité
        updatedItems[existingItemIndex].quantity -= 1;
        setFoodItems(updatedItems);
      } else {
        // Supprimer l'article si la quantité est 1
        setFoodItems(updatedItems.filter(i => i.item !== itemId));
      }
    }
  };

  const getItemQuantity = (itemId: number) => {
    const existingItem = foodItems.find(i => i.item === itemId);
    return existingItem ? existingItem.quantity : 0;
  };

  const getImageSource = (item: RestaurantItem) => {
    if (item.image) {
      const imageUrl = item.image.startsWith('http') 
        ? item.image 
        : `http://192.168.1.198:8000${item.image}`;
      return { uri: imageUrl };
    }
    return require('../../../assets/images/pop.jpg');
  };

  // const getCategoryLabel = (category: string) => {
  //   const labels: { [key: string]: string } = {
  //     'drink': 'Boissons',
  //     'snack': 'Snacks',
  //     'popcorn': 'Popcorn',
  //     'combo': 'Menus'
  //   };
  //   return labels[category] || category;
  // };

  const foodPrice = foodItems.reduce((total, item) => 
    total + ((item.price_at_time || item.price) * item.quantity), 0);


  const orderedItems = React.useMemo(() => {
  const orderMap = getCategoryOrder();
  return [...menuItems].sort((a, b) => {
    const ao = orderMap.has(a.category_name) ? orderMap.get(a.category_name)! : Number.MAX_SAFE_INTEGER;
    const bo = orderMap.has(b.category_name) ? orderMap.get(b.category_name)! : Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name);
  });
}, [menuItems, menuItemsCategory]);

// Group items by category_name after sorting
const itemsByCategory: { [key: string]: RestaurantItem[] } = {};
orderedItems.forEach(item => {
  const key = item.category_name || 'Autres';
  if (!itemsByCategory[key]) itemsByCategory[key] = [];
  itemsByCategory[key].push(item);
});

// Render categories in fetched order
const orderedCategoryNames = React.useMemo(() => {
  const present = new Set(Object.keys(itemsByCategory));
  // keep only categories that exist in items, in backend order, then append unknowns
  const known = menuItemsCategory
    .map(c => c.category_name)
    .filter(name => present.has(name));
  const unknown = Array.from(present).filter(name => !known.includes(name));
  return [...known, ...unknown];
}, [itemsByCategory, menuItemsCategory]);

  if (loading) {
    return (
      <View style={[styles.centerContent, { padding: 40 }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Chargement du menu...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContent, { padding: 40 }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={fetchRestaurantItems}
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Grouper les articles par catégorie
  // const itemsByCategory: { [key: string]: RestaurantItem[] } = {};
  // menuItems.forEach(item => {
  //   if (!itemsByCategory[item.category_name]) {
  //     itemsByCategory[item.category_name] = [];
  //   }
  //   itemsByCategory[item.category_name].push(item);
  // });


  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        Restauration
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Commandez vos snacks et boissons
      </Text>

      <ScrollView style={styles.scrollView}>
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={[styles.categoryTitle, { color: theme.colors.onBackground }]}>
              {getCategoryLabel(category)}
            </Text>
            <View style={styles.categoryContainer}>
              {items.map((item) => {
                const isOutOfStock = !item.is_available;
                const quantity = getItemQuantity(item.id);
                const isSelected = quantity > 0;
                const stock = (item as any).stock;
                
                return (
                  <View key={item.id} style={styles.menuItemContainer}>
                    <TouchableOpacity
                      style={[
                        styles.menuItem, 
                        { 
                          backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceVariant,
                          opacity: isOutOfStock ? 0.6 : 1
                        }
                      ]}
                      onPress={() => addItem(item)}
                      disabled={isOutOfStock}
                    >
                      <Image 
                        source={getImageSource(item)} 
                        style={styles.itemImage} 
                        resizeMode="cover"
                      />
                      <View style={styles.itemInfo}>
                        <Text style={[
                          styles.itemName, 
                          { color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface }
                        ]}>
                          {item.name}
                        </Text>
                        <Text 
                          style={[
                            styles.itemDescription, 
                            { color: isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }
                          ]}
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>

                        <Text 
                          style={[
                            styles.itemDescription, 
                            { color: isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }
                          ]}
                          numberOfLines={2}
                        >
                          {item.stock} en stock
                        </Text>
                        <Text style={[
                          styles.itemPrice, 
                          { color: isSelected ? theme.colors.onPrimary : theme.colors.primary }
                        ]}>
                          {Number(item.price).toFixed(2)} MGA
                        </Text>
                        {isOutOfStock && (
                          <Text style={[styles.outOfStock, { color: theme.colors.error }]}>
                            Épuisé
                          </Text>
                        )}
                      </View>
                      {!isOutOfStock && (
                        <View style={styles.selectionIndicator}>
                          <Ionicons 
                            name="add-circle" 
                            size={24} 
                            color={isSelected ? theme.colors.onPrimary : theme.colors.primary} 
                          />
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Contrôle de quantité */}
                    {quantity > 0 && (
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={[styles.quantityButton, { backgroundColor: theme.colors.error }]}
                          onPress={() => removeItem(item.id)}
                        >
                          <Ionicons name="remove" size={16} color={theme.colors.onPrimary} />
                        </TouchableOpacity>
                        
                        <View style={[styles.quantityDisplay, { backgroundColor: theme.colors.surface }]}>
                          <Text style={[styles.quantityText, { color: theme.colors.onSurface }]}>
                            {quantity}
                          </Text>
                        </View>
                        
                        <TouchableOpacity
                          style={[styles.quantityButton, { backgroundColor: theme.colors.primary }]}
                          onPress={() => addItem(item)}
                        >
                          <Ionicons name="add" size={16} color={theme.colors.onPrimary} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {foodItems.length > 0 && (
        <View style={[styles.summary, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.onSurface }]}>
            Votre commande ({foodItems.reduce((total, item) => total + item.quantity, 0)} article{foodItems.reduce((total, item) => total + item.quantity, 0) > 1 ? 's' : ''})
          </Text>
          {foodItems.map((item) => (
            <View key={item.item} style={styles.summaryItem}>
              <View style={styles.summaryItemInfo}>
                <Text style={[styles.summaryText, { color: theme.colors.onSurface }]}>
                  {item.name} × {item.quantity}
                </Text>
              </View>
              <Text style={[styles.summaryPrice, { color: theme.colors.onSurface }]}>
                {((item.price_at_time || item.price) * item.quantity).toFixed(2)} MGA
              </Text>
            </View>
          ))}
          <View style={[styles.summaryTotal, { borderTopColor: theme.colors.outline }]}>
            <Text style={[styles.totalText, { color: theme.colors.onSurface }]}>
              Total restauration
            </Text>
            <Text style={[styles.totalPrice, { color: theme.colors.primary }]}>
              {foodPrice.toFixed(2)} MGA
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingLeft: 8,
  },
  categoryContainer: {
    gap: 16,
  },
  menuItemContainer: {
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  outOfStock: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  selectionIndicator: {
    padding: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    minWidth: 40,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summary: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FoodStep;