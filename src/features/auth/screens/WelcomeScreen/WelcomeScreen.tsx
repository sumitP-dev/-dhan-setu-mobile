import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Image,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type ImageSourcePropType,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import LottieView from 'lottie-react-native';

import { AppButton, AppText, PageDots, Screen } from '../../../../components';
import type { AuthScreenProps } from '../../../../navigation/types';
import { colors } from '../../../../theme';
import { useReduceMotion } from '../../../../utils/useReduceMotion';
import { TextLink } from '../TextLink';
import { SLIDES, type Slide } from './slides';
import { styles } from './WelcomeScreen.styles';

const astronaut = require('../../../../assets/animations/astronaut.json');

export function WelcomeScreen({ navigation }: AuthScreenProps<'Welcome'>) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const goTo = (next: number) => {
    setIndex(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <Screen
      edges={['top', 'bottom']}
      padded={false}
      background={colors.surface}
      testID="welcome-screen"
      footer={
        isLast ? (
          <>
            <AppButton
              title="Create account"
              onPress={() => navigation.navigate('Register')}
            />
            <TextLink
              prompt="Already have an account?"
              action="Log in"
              onPress={() => navigation.navigate('Login')}
            />
          </>
        ) : (
          <AppButton title="Next" onPress={() => goTo(index + 1)} />
        )
      }
    >
      <View style={styles.topBar}>
        {isLast ? null : (
          <AppButton
            title="Skip"
            variant="ghost"
            size="sm"
            fullWidth={false}
            onPress={() => goTo(SLIDES.length - 1)}
          />
        )}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={s => s.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        renderItem={({ item }) => (
          <SlideView
            slide={item}
            width={width}
            active={item === SLIDES[index]}
          />
        )}
      />

      <PageDots count={SLIDES.length} index={index} testID="welcome-dots" />
    </Screen>
  );
}

function SlideView({
  slide,
  width,
  active,
}: {
  slide: Slide;
  width: number;
  active: boolean;
}) {
  return (
    <View style={[styles.slide, { width }]}>
      {slide.heading ? (
        <AppText
          variant="display"
          align="center"
          accessibilityRole="header"
          style={styles.heading}
        >
          {slide.heading.lead}
          {'\n'}
          <AppText variant="display" color="brand" style={styles.heading}>
            {slide.heading.highlight}
          </AppText>
        </AppText>
      ) : null}
      <View style={styles.art}>
        <View style={styles.artCircle} />
        {slide.art === 'mascot' ? (
          <Mascot playing={active} />
        ) : (
          <View
            style={styles.art3d}
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            testID={`welcome-art-${slide.key}`}
          >
            <View style={styles.ground} />
            <Floating
              source={slide.art.main}
              style={styles.main3d}
              playing={active}
              distance={8}
              duration={2400}
            />
            <Floating
              source={slide.art.accents[0]}
              style={[styles.accent3d, styles.accentTop]}
              playing={active}
              distance={10}
              duration={1900}
              delay={300}
            />
            <Floating
              source={slide.art.accents[1]}
              style={[styles.accent3d, styles.accentBottom]}
              playing={active}
              distance={10}
              duration={2100}
              delay={700}
            />
          </View>
        )}
      </View>
      <View style={styles.text}>
        <AppText
          variant="h1"
          align="center"
          accessibilityRole={slide.heading ? undefined : 'header'}
        >
          {slide.title}
        </AppText>
        <AppText variant="body" color="textSecondary" align="center">
          {slide.body}
        </AppText>
      </View>
    </View>
  );
}

/** The astronaut. Pauses when its slide is off screen or Reduce motion is on. */
function Mascot({ playing }: { playing: boolean }) {
  const ref = useRef<LottieView>(null);
  const reduceMotion = useReduceMotion();
  const shouldPlay = playing && !reduceMotion;

  useEffect(() => {
    if (shouldPlay) {
      ref.current?.play();
    } else {
      ref.current?.pause();
    }
  }, [shouldPlay]);

  return (
    <LottieView
      ref={ref}
      source={astronaut}
      autoPlay={shouldPlay}
      loop
      resizeMode="contain"
      style={styles.mascot}
      testID="welcome-mascot"
    />
  );
}

/**
 * A 3D icon that bobs gently up and down. Still when its slide is off screen or
 * Reduce motion is on.
 */
function Floating({
  source,
  style,
  playing,
  distance,
  duration,
  delay = 0,
}: {
  source: ImageSourcePropType;
  style: StyleProp<ViewStyle>;
  playing: boolean;
  distance: number;
  duration: number;
  delay?: number;
}) {
  const reduceMotion = useReduceMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const shouldPlay = playing && !reduceMotion;

  useEffect(() => {
    if (!shouldPlay) {
      progress.stopAnimation();
      return;
    }
    const half = {
      duration: duration / 2,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    };
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, ...half }),
        Animated.timing(progress, { toValue: 0, ...half }),
      ]),
    );
    const timer = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [shouldPlay, progress, duration, delay]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -distance],
  });

  return (
    <Animated.View style={[style, { transform: [{ translateY }] }]}>
      <Image source={source} style={styles.image3d} resizeMode="contain" />
    </Animated.View>
  );
}
