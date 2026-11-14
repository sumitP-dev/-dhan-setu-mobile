import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import {
  AppButton,
  AppText,
  Card,
  EmptyState,
  Icon,
  IconBadge,
  ListRow,
  LoadingView,
  Screen,
} from '../../../../components';
import type { KycRead } from '../../../../api/types';
import type { AppScreenProps } from '../../../../navigation/types';
import { colors } from '../../../../theme';
import { getApiError } from '../../../../utils/apiError';
import { useRefreshOnFocus } from '../../../../utils/useRefreshOnFocus';
import { useOpenKycStep } from '../../flow';
import { useKyc } from '../../hooks';
import {
  KYC_STATUS,
  kycAction,
  kycMessage,
  kycSteps,
  type KycStep,
} from '../../status';
import { styles } from './KycScreen.styles';

const STEP_ICON: Record<
  KycStep['state'],
  {
    name: 'check-circle' | 'circle-outline' | 'circle-slice-8';
    color: string;
    label: string;
  }
> = {
  done: { name: 'check-circle', color: colors.success, label: 'Done' },
  current: { name: 'circle-slice-8', color: colors.brand, label: 'Next' },
  todo: {
    name: 'circle-outline',
    color: colors.textPlaceholder,
    label: 'To do',
  },
};

function StatusCard({ kyc }: { kyc: KycRead }) {
  const copy = KYC_STATUS[kyc.status];
  return (
    <Card style={styles.status} testID="kyc-status">
      <IconBadge icon={copy.icon} tone={copy.tone} size={48} />
      <View style={styles.statusText}>
        <AppText variant="h3" accessibilityRole="header">
          {copy.title}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary">
          {kycMessage(kyc)}
        </AppText>
      </View>
    </Card>
  );
}

function Steps({ steps }: { steps: KycStep[] }) {
  return (
    <Card padded={false}>
      {steps.map((step, index) => {
        const mark = STEP_ICON[step.state];
        return (
          <View
            key={step.key}
            style={[styles.step, index > 0 && styles.stepDivider]}
            accessible
            accessibilityLabel={`Step ${index + 1}, ${step.title}: ${
              mark.label
            }`}
            testID={`kyc-step-${step.key}`}
          >
            <IconBadge
              icon={step.icon}
              tone={step.state === 'current' ? 'brand' : 'neutral'}
              size={40}
            />
            <View style={styles.stepText}>
              <AppText variant="bodyMedium">{step.title}</AppText>
              <AppText variant="caption" color="textMuted">
                {step.subtitle}
              </AppText>
            </View>
            <Icon name={mark.name} size={22} color={mark.color} />
          </View>
        );
      })}
    </Card>
  );
}

/** KYC status, the three steps and what to do next. */
export function KycScreen({ navigation }: AppScreenProps<'Kyc'>) {
  const kyc = useKyc();
  const openStep = useOpenKycStep();
  useRefreshOnFocus(kyc.refetch);

  if (kyc.isPending) {
    return <LoadingView />;
  }
  if (kyc.isError) {
    return (
      <Screen testID="kyc-screen">
        <EmptyState
          icon="cloud-off-outline"
          tone="danger"
          title="Couldn’t load your KYC"
          message={getApiError(kyc.error).message}
          actionTitle="Try again"
          onAction={() => kyc.refetch()}
        />
      </Screen>
    );
  }

  const data = kyc.data;
  const action = kycAction(data);
  return (
    <Screen
      padded={false}
      testID="kyc-screen"
      footer={
        action ? (
          <AppButton
            title={action}
            onPress={() => openStep(data.next_step ?? 'digilocker')}
            fullWidth
            size="lg"
          />
        ) : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={kyc.isRefetching}
            onRefresh={() => {
              kyc.refetch();
            }}
            tintColor={colors.brand}
          />
        }
      >
        <StatusCard kyc={data} />
        <AppText
          variant="overline"
          color="textMuted"
          style={styles.sectionTitle}
        >
          STEPS
        </AppText>
        <Steps steps={kycSteps(data)} />
        {data.details && data.status === 'in_progress' ? (
          <Card padded={false} style={styles.detailsRow}>
            <ListRow
              title="Your details"
              subtitle="From your Aadhaar and PAN"
              icon="account-details-outline"
              onPress={() => navigation.navigate('KycDetails')}
              testID="kyc-details-row"
            />
          </Card>
        ) : null}
        <View style={styles.privacy}>
          <Icon name="lock-outline" size={16} color={colors.textMuted} />
          <AppText
            variant="caption"
            color="textMuted"
            style={styles.privacyText}
          >
            We never store your full Aadhaar number or your Aadhaar photo. Your
            details are encrypted.
          </AppText>
        </View>
      </ScrollView>
    </Screen>
  );
}
