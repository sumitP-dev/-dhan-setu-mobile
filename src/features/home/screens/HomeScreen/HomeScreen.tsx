import React from 'react';
import { Pressable, View } from 'react-native';

import {
  ActionTile,
  AppText,
  Avatar,
  Card,
  Icon,
  IconBadge,
  Screen,
} from '../../../../components';
import type { AppScreenProps } from '../../../../navigation/types';
import { useAppSelector } from '../../../../store';
import { colors, spacing } from '../../../../theme';
import { firstName, greeting } from '../../../../utils/format';
import { styles } from './HomeScreen.styles';

export function HomeScreen({ navigation }: AppScreenProps<'Home'>) {
  const user = useAppSelector(s => s.auth.user);
  const name = user?.full_name ?? '';

  return (
    <Screen edges={['top']} scroll testID="home-screen">
      <View style={styles.header}>
        <View style={styles.greeting}>
          <AppText variant="bodySmall" color="textMuted">
            {greeting()},
          </AppText>
          <AppText variant="h2" numberOfLines={1}>
            {firstName(name) || 'Welcome'}
          </AppText>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Profile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          hitSlop={spacing.sm}
          testID="home-profile-button"
        >
          <Avatar name={name || '?'} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <AppText variant="overline" color="brandMuted">
          DHAN SETU
        </AppText>
        <AppText variant="h2" color="textInverse">
          Payments, made simple
        </AppText>
        <AppText variant="bodySmall" color="brandMuted">
          Cards, UPI and bill payments in one secure place.
        </AppText>
        <View style={styles.heroFooter}>
          <Icon
            name="shield-check-outline"
            size={16}
            color={colors.brandMuted}
          />
          <AppText variant="caption" color="brandMuted">
            Protected with bank-grade encryption
          </AppText>
        </View>
      </View>

      <AppText variant="overline" color="textMuted" style={styles.sectionTitle}>
        QUICK ACTIONS
      </AppText>
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <ActionTile
            icon="credit-card-outline"
            title="Cards"
            subtitle="Saved cards and card payments"
            onPress={() => navigation.navigate('Cards')}
            testID="tile-cards"
          />
          <ActionTile
            icon="lightning-bolt"
            title="UPI"
            subtitle="Pay any UPI ID instantly"
            tone="accent"
            onPress={() => navigation.navigate('Upi')}
            testID="tile-upi"
          />
        </View>
        <View style={styles.gridRow}>
          <ActionTile
            icon="receipt-text-outline"
            title="Pay bills"
            subtitle="Electricity, mobile, DTH and more"
            tone="warning"
            onPress={() => navigation.navigate('Bbps')}
            testID="tile-bbps"
          />
          <ActionTile
            icon="swap-horizontal"
            title="Transactions"
            subtitle="Your payment history"
            tone="info"
            onPress={() => navigation.navigate('Transactions')}
            testID="tile-transactions"
          />
        </View>
      </View>

      <AppText variant="overline" color="textMuted" style={styles.sectionTitle}>
        RECENT ACTIVITY
      </AppText>
      <Card style={styles.recent}>
        <IconBadge icon="swap-horizontal" tone="neutral" size={40} />
        <View style={styles.recentText}>
          <AppText variant="bodyMedium">No transactions yet</AppText>
          <AppText variant="caption" color="textMuted">
            Your payments will show up here.
          </AppText>
        </View>
      </Card>
    </Screen>
  );
}
