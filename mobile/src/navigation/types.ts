export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  ForceUpdate: { currentVersion: string; requiredVersion: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  CartTab: undefined;
  WishlistTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Search: undefined;
  ProductList: { categoryId?: number; brandId?: number; title?: string; search?: string };
  ProductDetail: { slug: string };
  CategoryList: undefined;
  Notifications: undefined;
};

export type CartStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderNumber: string };
  OrderDetail: { orderNumber: string };
};

export type WishlistStackParamList = {
  Wishlist: undefined;
  ProductDetail: { slug: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Addresses: undefined;
  AddAddress: undefined;
  EditAddress: { addressId: number };
  Orders: undefined;
  OrderDetail: { orderNumber: string };
  OrderReceipt: { orderNumber: string };
  Support: undefined;
  Page: { slug: string; title: string };
  FAQ: undefined;
};
