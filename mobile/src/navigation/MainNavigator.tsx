import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import GuestGate from '../components/GuestGate';
import HomeScreen from '../screens/home/HomeScreen';
import ProductListScreen from '../screens/product/ProductListScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/checkout/CheckoutScreen';
import OrderSuccessScreen from '../screens/order/OrderSuccessScreen';
import OrderDetailScreen from '../screens/order/OrderDetailScreen';
import OrdersScreen from '../screens/order/OrdersScreen';
import OrderTrackingScreen from '../screens/order/OrderTrackingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import AddressesScreen from '../screens/profile/AddressesScreen';
import AddAddressScreen from '../screens/profile/AddAddressScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import PageScreen from '../screens/profile/PageScreen';
import FaqScreen from '../screens/profile/FaqScreen';
import SearchScreen from '../screens/search/SearchScreen';
import OrderReceiptScreen from '../screens/profile/OrderReceiptScreen';
import SupportScreen from '../screens/support/SupportScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Search" component={SearchScreen} />
      <HomeStack.Screen name="ProductList" component={ProductListScreen} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    </HomeStack.Navigator>
  );
}

function CartStackNav({ navigation }: any) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <GuestGate navigation={navigation} title="Your Cart" message="Log in to view your cart and checkout." />;
  }
  return (
    <CartStack.Navigator screenOptions={{ headerShown: false }}>
      <CartStack.Screen name="Cart" component={CartScreen} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} />
      <CartStack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <CartStack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </CartStack.Navigator>
  );
}

function OrdersStackNav({ navigation }: any) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return (
      <GuestGate
        navigation={navigation}
        title="Track Your Orders"
        message="Log in to view your order history and track deliveries."
      />
    );
  }
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <OrdersStack.Screen name="OrderReceipt" component={OrderReceiptScreen} />
    </OrdersStack.Navigator>
  );
}

function ProfileStackNav({ navigation }: any) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <GuestGate navigation={navigation} title="Your Account" message="Log in to view your profile, orders, and settings." />;
  }
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <ProfileStack.Screen name="Addresses" component={AddressesScreen} />
      <ProfileStack.Screen name="AddAddress" component={AddAddressScreen} />
      <ProfileStack.Screen name="Orders" component={OrdersScreen} />
      <ProfileStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <ProfileStack.Screen name="OrderReceipt" component={OrderReceiptScreen} />
      <ProfileStack.Screen name="Support" component={SupportScreen} />
      <ProfileStack.Screen name="Page" component={PageScreen} />
      <ProfileStack.Screen name="FAQ" component={FaqScreen} />
    </ProfileStack.Navigator>
  );
}

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const iconMap: Record<string, [string, string]> = {
    Home:    ['home',            'home-outline'],
    Cart:    ['cart',            'cart-outline'],
    Orders:  ['receipt',         'receipt-outline'],
    Profile: ['person',          'person-outline'],
  };
  const [activeIcon, inactiveIcon] = iconMap[name] ?? ['ellipse', 'ellipse-outline'];
  const size = focused ? 24 : 22;
  return (
    <IonIcon
      name={focused ? activeIcon : inactiveIcon}
      size={size}
      color={focused ? COLORS.primary : COLORS.gray}
    />
  );
}

function CartTabIcon({ focused }: { focused: boolean }) {
  const { cart } = useCartStore();
  const count = cart?.items_count ?? 0;
  return (
    <View>
      <TabIcon name="Cart" focused={focused} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNav}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStackNav}
        options={{ tabBarLabel: 'Cart', tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} /> }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackNav}
        options={{ tabBarLabel: 'Orders', tabBarIcon: ({ focused }) => <TabIcon name="Orders" focused={focused} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNav}
        options={{ tabBarLabel: 'Account', tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabLabel: { fontSize: 11, fontWeight: '500' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
});
