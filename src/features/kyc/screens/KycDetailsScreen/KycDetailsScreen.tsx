import React from 'react';
import { ScrollView, View } from 'react-native';

import {
  AppButton,
  AppText,
  Banner,
  Card,
  EmptyState,
  LoadingView,
  Screen,
} from '../../../../components';
import type { KycDetails } from '../../../../api/types';
import type { AppScreenProps } from '../../../../navigation/types';
import { getApiError } from '../../../../utils/apiError';
import { formatCalendarDate } from '../../../../utils/format';
import { useOpenKycStep } from '../../flow';
import { useKyc } from '../../hooks';
import { styles } from './KycDetailsScreen.styles';

const GENDER: Record<KycDetails['gender'], string> = {
  M: 'Male',
  F: 'Female',
  T: 'Transgender',
};

function rows(details: KycDetails) {
  return [
    { label: 'Name', value: details.name },
    {
      label: 'Date of birth',
      value: details.date_of_birth
        ? formatCalendarDate(details.date_of_birth)
        : `Born ${details.birth_year}`,
    },
    { label: 'Gender', value: GENDER[details.gender] },
    { label: 'Address', value: details.address ?? 'Not shared' },
    { label: 'Aadhaar', value: details.aadhaar },
    {
      label: 'PAN',
      value: details.pan
        ? `${details.pan}${details.pan_verified ? '  ·  Verified' : ''}`
        : 'Not added yet',
    },
  ];
}

/** What DigiLocker shared, for the user to check, then the next step. */
export function KycDetailsScreen({ navigation }: AppScreenProps<'KycDetails'>) {
  const kyc = useKyc();
  const openStep = useOpenKycStep();

  if (kyc.isPending) {
    return <LoadingView />;
  }
  if (kyc.isError || !kyc.data.details) {
    return (
      <Screen testID="kyc-details-screen">
        <EmptyState
          icon={kyc.isError ? 'cloud-off-outline' : 'file-question-outline'}
          tone={kyc.isError ? 'danger' : 'neutral'}
          title={kyc.isError ? 'Couldn’t load your details' : 'No details yet'}
          message={
            kyc.isError
              ? getApiError(kyc.error).message
              : 'Share your Aadhaar from DigiLocker first.'
          }
          actionTitle={kyc.isError ? 'Try again' : 'Back to KYC'}
          onAction={() =>
            kyc.isError ? kyc.refetch() : navigation.popTo('Kyc')
          }
        />
      </Screen>
    );
  }

  const { details, next_step: next, can_start: canContinue } = kyc.data;
  const needsPan = canContinue && next === 'pan';
  const footer = needsPan ? (
    <AppButton
      title="Enter PAN"
      onPress={() => navigation.navigate('KycPan')}
      fullWidth
      size="lg"
    />
  ) : canContinue && next && next !== 'digilocker' ? (
    <AppButton
      title="Continue"
      onPress={() => openStep(next)}
      fullWidth
      size="lg"
    />
  ) : undefined;

  return (
    <Screen padded={false} testID="kyc-details-screen" footer={footer}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="h2" accessibilityRole="header">
          Check your details
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.lead}>
          These came from DigiLocker. They’re what we’ll check your KYC against.
        </AppText>

        {needsPan && details.pan_issue_message ? (
          <View style={styles.banner}>
            <Banner
              tone="warning"
              title="PAN needed"
              message={details.pan_issue_message}
              testID="kyc-pan-issue"
            />
          </View>
        ) : null}

        <Card padded={false} style={styles.card} testID="kyc-details">
          {rows(details).map((row, index) => (
            <View
              key={row.label}
              style={[styles.row, index > 0 && styles.rowDivider]}
              accessible
              accessibilityLabel={`${row.label}: ${row.value}`}
            >
              <AppText variant="caption" color="textMuted">
                {row.label}
              </AppText>
              <AppText variant="bodyMedium">{row.value}</AppText>
            </View>
          ))}
        </Card>

        <AppText variant="caption" color="textMuted" style={styles.note}>
          Something wrong? Your Aadhaar details can only be changed with UIDAI.
          Update them there, then share from DigiLocker again.
        </AppText>
        {canContinue ? (
          <AppButton
            title="Share from DigiLocker again"
            variant="ghost"
            onPress={() => navigation.navigate('KycDigiLocker')}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}
