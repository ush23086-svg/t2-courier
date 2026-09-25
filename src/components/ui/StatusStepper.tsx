import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DeliveryStatus } from '@/types';

interface StatusStepperProps {
  currentStatus: DeliveryStatus;
}

const STEPS: { status: DeliveryStatus; label: string }[] = [
  { status: 'ACCEPTED', label: 'Accepted' },
  { status: 'PICKED_UP', label: 'Picked Up' },
  { status: 'DELIVERING', label: 'Delivering' },
  { status: 'DELIVERED', label: 'Delivered' },
];

export const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus }) => {
  const getStepIndex = (status: DeliveryStatus): number => {
    switch (status) {
      case 'ASSIGNED':
        return -1;
      case 'ACCEPTED':
        return 0;
      case 'PICKED_UP':
        return 1;
      case 'DELIVERING':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <React.Fragment key={step.status}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isCurrent && styles.circleCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    (isCompleted || isCurrent) && styles.circleTextActive,
                  ]}
                >
                  {isCompleted ? '✓' : index + 1}
                </Text>
              </View>
              <Text
                style={[
                  styles.label,
                  isCurrent && styles.labelCurrent,
                  isCompleted && styles.labelCompleted,
                ]}
                numberOfLines={1}
              >
                {step.label}
              </Text>
            </View>

            {!isLast && (
              <View
                style={[
                  styles.line,
                  index < currentIndex && styles.lineCompleted,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  circleCompleted: {
    backgroundColor: '#10B981',
  },
  circleCurrent: {
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#BFDBFE',
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  circleTextActive: {
    color: '#FFFFFF',
  },
  line: {
    height: 3,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: -18,
  },
  lineCompleted: {
    backgroundColor: '#10B981',
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  labelCurrent: {
    color: '#1F2937',
    fontWeight: '700',
  },
  labelCompleted: {
    color: '#10B981',
    fontWeight: '600',
  },
});
