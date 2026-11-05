import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import LottieView from 'lottie-react-native';

import {
  AppButton,
  AppText,
  Icon,
  IconBadge,
  PageDots,
  Screen,
} from '../../../../components';
import type { AuthScreenProps } from '../../../../navigation/types';
import { colors } from '../../../../theme';
import { useReduceMotion } from '../../../../utils/useReduceMotion';
import { TextLink } from '../TextLink';
import { SLIDES, type Slide } from './slides';
import { styles } from './WelcomeScreen.styles';

const astronaut = require('../../../../assets/animations/astronaut.json');

/** Onboarding: swipeable intro slides, then Create account or Log in. */
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
          <>
            <Icon name={slide.art.main} size={112} color={colors.brandStrong} />
            <View style={[styles.badge, styles.badgeTop]}>
              <IconBadge icon={slide.art.badges[0]} size={56} />
            </View>
            <View style={[styles.badge, styles.badgeBottom]}>
              <IconBadge icon={slide.art.badges[1]} tone="accent" size={48} />
            </View>
          </>
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
