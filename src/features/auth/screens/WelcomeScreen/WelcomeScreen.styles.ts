import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '../../../../theme';

const ART = 280;
const MAIN = 150;

/**
 * iOS draws this shadow around the icon's actual shape. Android has no equivalent for
 * transparent images (elevation would draw a box), so it relies on the ground shadow.
 */
const iconShadow = {
  shadowColor: colors.brandStrong,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.18,
  shadowRadius: 12,
};

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
  art3d: { ...StyleSheet.absoluteFill },
  // The source PNGs are 256px, so the big icon stays at 150pt to remain sharp.
  main3d: {
    position: 'absolute',
    width: MAIN,
    height: MAIN,
    top: (ART - MAIN) / 2 - 8,
    left: (ART - MAIN) / 2,
    ...iconShadow,
  },
  // Soft oval just under the main icon (the PNGs have ~10% empty space at the bottom).
  ground: {
    position: 'absolute',
    width: 96,
    height: 12,
    borderRadius: radius.pill,
    left: (ART - 96) / 2,
    top: (ART + MAIN) / 2 - 18,
    backgroundColor: colors.brandMuted,
    opacity: 0.55,
  },
  accent3d: { position: 'absolute', width: 76, height: 76, ...iconShadow },
  accentTop: { top: 28, right: 18 },
  accentBottom: { bottom: 30, left: 14 },
  image3d: { width: '100%', height: '100%' },
  heading: { fontSize: 36, lineHeight: 44, letterSpacing: -0.8 },
  text: { gap: spacing.md, alignItems: 'center' },
});
