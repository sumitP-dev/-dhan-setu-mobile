import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '../../../../theme';

const ART = 280;

export const styles = StyleSheet.create({
  topBar: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.xxl,
  },
  art: {
    width: ART,
    height: ART,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artCircle: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    borderWidth: 10,
    borderColor: colors.surface,
  },
  mascot: { width: ART, height: ART },
  badge: {
    position: 'absolute',
    borderRadius: radius.md,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  badgeTop: { top: 36, right: 20 },
  badgeBottom: { bottom: 40, left: 16 },
  heading: { fontSize: 36, lineHeight: 44, letterSpacing: -0.8 },
  text: { gap: spacing.md, alignItems: 'center' },
});
