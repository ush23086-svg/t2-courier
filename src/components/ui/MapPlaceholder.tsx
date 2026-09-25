import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface MapPlaceholderProps {
  pickupAddress?: string;
  deliveryAddress?: string;
  style?: ViewStyle;
}

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({
  pickupAddress,
  deliveryAddress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.gridOverlay}>
        <View style={styles.routeContainer}>
          <View style={styles.pinPickup}>
            <Text style={styles.pinText}>A</Text>
          </View>
          <View style={styles.routeDottedLine} />
          <View style={styles.pinDelivery}>
            <Text style={styles.pinText}>B</Text>
          </View>
        </View>
        <Text style={styles.mapNotice}>Interactive Navigation Map (T2 Navigation)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 180,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    marginBottom: 12,
  },
  pinPickup: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  pinDelivery: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  pinText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  routeDottedLine: {
    flex: 1,
    height: 2,
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderStyle: 'dashed',
    marginHorizontal: 8,
  },
  mapNotice: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
