export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
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

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Addresses: undefined;
  AddAddress: undefined;
  EditAddress: { addressId: number };
  Orders: undefined;
  OrderDetail: { orderNumber: string };
  Page: { slug: string; title: string };
  FAQ: undefined;
};
