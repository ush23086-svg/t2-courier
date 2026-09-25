import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { DeliveryStatus, CourierStatus } from '@/types';

type BadgeType = DeliveryStatus | CourierStatus | 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';

interface BadgeProps {
  label: string;
  type?: BadgeType;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, type = 'INFO', style }) => {
  const getBadgeColors = (): { bg: string; text: string } => {
    switch (type) {
      case 'ASSIGNED':
      case 'INFO':
        return { bg: '#E0F2FE', text: '#0369A1' };
      case 'ACCEPTED':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'PICKED_UP':
        return { bg: '#FED7AA', text: '#C2410C' };
      case 'DELIVERING':
      case 'ON_DELIVERY':
        return { bg: '#E0E7FF', text: '#4338CA' };
      case 'DELIVERED':
      case 'AVAILABLE':
      case 'SUCCESS':
        return { bg: '#D1FAE5', text: '#047857' };
      case 'CANCELLED':
      case 'OFFLINE':
      case 'DANGER':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'WARNING':
        return { bg: '#FFEDD5', text: '#C2410C' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const colors = getBadgeColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
