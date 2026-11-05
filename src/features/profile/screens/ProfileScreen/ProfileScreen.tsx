import React from 'react';
import { Alert, View } from 'react-native';

import {
  AppText,
  Avatar,
  Card,
  Divider,
  ListRow,
  Screen,
} from '../../../../components';
import type { AppScreenProps } from '../../../../navigation/types';
import { useAuthStore } from '../../../../store/authStore';
import { formatPhone } from '../../../../utils/format';
import { styles } from './ProfileScreen.styles';

const ROLE_LABELS = {
  customer: 'Personal account',
  merchant: 'Merchant account',
  admin: 'Admin',
};

export function ProfileScreen(_: AppScreenProps<'Profile'>) {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  const confirmLogout = () =>
    Alert.alert('Log out?', 'You will need to log in again to use Dhan Setu.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);

  return (
    <Screen scroll testID="profile-screen">
      <View style={styles.identity}>
        <Avatar name={user?.full_name ?? '?'} size={72} />
        <View style={styles.identityText}>
          <AppText variant="h2" align="center">
            {user?.full_name}
          </AppText>
          <AppText variant="bodySmall" color="textMuted" align="center">
            {user ? ROLE_LABELS[user.role] : ''}
          </AppText>
        </View>
      </View>

      <Card padded={false}>
        <ListRow icon="email-outline" title="Email" subtitle={user?.email} />
        <Divider inset={64} />
        <ListRow
          icon="phone-outline"
          title="Mobile"
          subtitle={user ? formatPhone(user.phone) : undefined}
        />
        <Divider inset={64} />
        <ListRow
          icon="check-decagram-outline"
          tone="brand"
          title="Account status"
          subtitle={user?.status === 'active' ? 'Verified' : 'Not verified'}
        />
      </Card>

      <Card padded={false} style={styles.logout}>
        <ListRow
          icon="logout"
          title="Log out"
          destructive
          onPress={confirmLogout}
          testID="logout-button"
        />
      </Card>
    </Screen>
  );
}
