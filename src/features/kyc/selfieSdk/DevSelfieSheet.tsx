import React from 'react';
import { Modal, View } from 'react-native';

import { AppButton, AppText } from '../../../components';
import { styles } from './DevSelfieSheet.styles';

/** What the stand-in can play; matches the backend's FakeSelfie outcomes. */
export type DevSelfieChoice = 'pass' | 'low_match' | 'not_live' | 'no_face';

const CHOICES: { value: DevSelfieChoice; title: string }[] = [
  { value: 'pass', title: 'Live selfie that matches' },
  { value: 'low_match', title: 'Doesn’t match the Aadhaar photo' },
  { value: 'not_live', title: 'Not live (a photo of a photo)' },
  { value: 'no_face', title: 'No face found' },
];

type Props = {
  visible: boolean;
  busy: boolean;
  onChoose: (choice: DevSelfieChoice) => void;
  onCancel: () => void;
};

/**
 * Development builds only: stands in for the provider's selfie SDK, which isn't added
 * yet. The choice goes to the backend's fake provider, like the real SDK would send
 * the selfie to the real provider.
 */
export function DevSelfieSheet({ visible, busy, onChoose, onCancel }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet} testID="dev-selfie-sheet">
          <View style={styles.tag}>
            <AppText variant="caption" color="warning">
              Development only
            </AppText>
          </View>
          <AppText variant="h3" accessibilityRole="header">
            Selfie SDK stand-in
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            No camera here. Choose what the provider’s selfie check finds.
          </AppText>
          <View style={styles.choices}>
            {CHOICES.map(choice => (
              <AppButton
                key={choice.value}
                title={choice.title}
                variant={choice.value === 'pass' ? 'primary' : 'outline'}
                disabled={busy}
                onPress={() => onChoose(choice.value)}
                fullWidth
              />
            ))}
            <AppButton
              title="Cancel"
              variant="ghost"
              disabled={busy}
              onPress={onCancel}
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
