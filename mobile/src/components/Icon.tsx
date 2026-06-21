/**
 * Centralized icon component wrapping react-native-vector-icons (Ionicons).
 * Use this everywhere instead of emoji characters.
 *
 * All icons come from the Ionicons set which is bundled with
 * react-native-vector-icons and requires no extra native linking in RN 0.60+.
 */
import React from 'react';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export type IconName =
  // Navigation
  | 'home' | 'home-outline'
  | 'cart' | 'cart-outline'
  | 'heart' | 'heart-outline'
  | 'person' | 'person-outline'
  // Actions
  | 'search' | 'close' | 'close-circle'
  | 'chevron-back' | 'chevron-forward' | 'chevron-down' | 'chevron-up'
  | 'arrow-back' | 'arrow-forward'
  | 'share-social' | 'share-outline'
  | 'filter' | 'filter-outline'
  | 'trash' | 'trash-outline'
  | 'create' | 'create-outline'
  | 'add' | 'remove'
  | 'checkmark' | 'checkmark-circle' | 'checkmark-circle-outline'
  | 'close-circle-outline'
  | 'refresh' | 'refresh-circle'
  // Status / Info
  | 'star' | 'star-outline' | 'star-half'
  | 'information-circle' | 'information-circle-outline'
  | 'warning' | 'warning-outline'
  | 'alert-circle' | 'alert-circle-outline'
  // E-commerce
  | 'bag-handle' | 'bag-handle-outline'
  | 'pricetag' | 'pricetag-outline'
  | 'card' | 'card-outline'
  | 'wallet' | 'wallet-outline'
  | 'cube' | 'cube-outline'
  | 'car' | 'car-outline'
  | 'bicycle' | 'bicycle-outline'
  | 'storefront' | 'storefront-outline'
  // User / Profile
  | 'mail' | 'mail-outline'
  | 'call' | 'call-outline'
  | 'lock-closed' | 'lock-closed-outline'
  | 'lock-open' | 'lock-open-outline'
  | 'eye' | 'eye-outline' | 'eye-off' | 'eye-off-outline'
  | 'log-out' | 'log-out-outline'
  | 'settings' | 'settings-outline'
  | 'notifications' | 'notifications-outline'
  | 'camera' | 'camera-outline'
  | 'image' | 'image-outline'
  // Location
  | 'location' | 'location-outline'
  | 'map' | 'map-outline'
  // Communication
  | 'chatbubble' | 'chatbubble-outline'
  | 'chatbubbles' | 'chatbubbles-outline'
  | 'headset' | 'headset-outline'
  | 'help-circle' | 'help-circle-outline'
  | 'help-buoy' | 'help-buoy-outline'
  // Media
  | 'play' | 'play-circle' | 'play-circle-outline'
  | 'images' | 'images-outline'
  // Misc
  | 'ellipse' | 'ellipse-outline'
  | 'grid' | 'grid-outline'
  | 'list' | 'list-outline'
  | 'options' | 'options-outline'
  | 'time' | 'time-outline'
  | 'calendar' | 'calendar-outline'
  | 'document-text' | 'document-text-outline'
  | 'receipt' | 'receipt-outline'
  | 'shield-checkmark' | 'shield-checkmark-outline'
  | 'flash' | 'flash-outline'
  | 'wifi' | 'wifi-outline'
  | 'cloud-offline' | 'cloud-offline-outline'
  | 'phone-portrait' | 'phone-portrait-outline'
  | 'logo-whatsapp';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: object;
}

export default function Icon({ name, size = 24, color = '#333', style }: IconProps) {
  return <IonIcon name={name} size={size} color={color} style={style} />;
}

/** Thin wrapper to render a star rating row (read-only). */
export function StarRating({
  rating,
  size = 14,
  color = '#F5A623',
}: {
  rating: number;
  size?: number;
  color?: string;
}) {
  return (
    <>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = rating >= i;
        const half = !filled && rating >= i - 0.5;
        return (
          <IonIcon
            key={i}
            name={filled ? 'star' : half ? 'star-half' : 'star-outline'}
            size={size}
            color={color}
          />
        );
      })}
    </>
  );
}
