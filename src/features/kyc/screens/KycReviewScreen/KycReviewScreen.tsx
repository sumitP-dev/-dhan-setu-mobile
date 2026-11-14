import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import {
  AppButton,
  AppText,
  Banner,
  Card,
  EmptyState,
  Icon,
  LoadingView,
  Screen,
} from '../../../../components';
import type { KycDetails } from '../../../../api/types';
import type { AppScreenProps } from '../../../../navigation/types';
import { colors } from '../../../../theme';
import { getApiError } from '../../../../utils/apiError';
import { kycQueryKey, useKyc, useSubmitKyc } from '../../hooks';
import { styles } from './KycReviewScreen.styles';

/** These mean the server's KYC isn't ready to submit (or already is submitted). */
const MOVED_ON = new Set(['kyc_already_submitted', 'kyc_already_verified']);

function checks(details: KycDetails) {
  return [
    {
      title: 'Aadhaar from DigiLocker',
      value: `${details.name}, ${details.aadhaar}`,
    },
    { title: 'PAN', value: details.pan ?? '' },
    { title: 'Live selfie', value: 'Matches your Aadhaar photo' },
  ];
}

/** Every step is done: the user confirms and sends the KYC for review. */
export function KycReviewScreen({ navigation }: AppScreenProps<'KycReview'>) {
  const queryClient = useQueryClient();
  const kyc = useKyc();
  const submitMutation = useSubmitKyc();
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (kyc.isPending) {
    return <LoadingView />;
  }
  if (kyc.isError || kyc.data.next_step !== 'submit' || !kyc.data.details) {
    return (
      <Screen testID="kyc-review-screen">
        <EmptyState
          icon={kyc.isError ? 'cloud-off-outline' : 'progress-check'}
          tone={kyc.isError ? 'danger' : 'neutral'}
          title={kyc.isError ? 'Couldn’t load your KYC' : 'Not ready to submit'}
          message={
            kyc.isError
              ? getApiError(kyc.error).message
              : 'Finish the other KYC steps first.'
          }
          actionTitle={kyc.isError ? 'Try again' : 'Back to KYC'}
          onAction={() =>
            kyc.isError ? kyc.refetch() : navigation.popTo('Kyc')
          }
        />
      </Screen>
    );
  }

  const submit = async () => {
    setError(null);
    try {
      await submitMutation.mutateAsync();
      // The KYC screen now says it's under review.
      navigation.popTo('Kyc');
    } catch (submitError) {
      const apiError = getApiError(submitError);
      await queryClient.invalidateQueries({ queryKey: kycQueryKey });
      if (MOVED_ON.has(apiError.code)) {
        navigation.popTo('Kyc');
        return;
      }
      setError(apiError.message);
    }
  };

  return (
    <Screen
      padded={false}
      testID="kyc-review-screen"
      footer={
        <AppButton
          title="Submit for review"
          onPress={submit}
          disabled={!confirmed}
          loading={submitMutation.isPending}
          fullWidth
          size="lg"
        />
      }
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="h2" accessibilityRole="header">
          Review and submit
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.lead}>
          All three steps are done. The Dhan Setu team checks your KYC, usually
          in less than a day.
        </AppText>
        {error ? (
          <View style={styles.banner}>
            <Banner tone="danger" message={error} testID="kyc-submit-error" />
          </View>
        ) : null}
        <Card padded={false} style={styles.card}>
          {checks(kyc.data.details).map((item, index) => (
            <View
              key={item.title}
              style={[styles.row, index > 0 && styles.rowDivider]}
              accessible
              accessibilityLabel={`${item.title}: done. ${item.value}`}
            >
              <Icon name="check-circle" size={22} color={colors.success} />
              <View style={styles.rowText}>
                <AppText variant="bodyMedium">{item.title}</AppText>
                <AppText variant="caption" color="textMuted">
                  {item.value}
                </AppText>
              </View>
            </View>
          ))}
        </Card>
        <Pressable
          style={styles.confirm}
          onPress={() => setConfirmed(value => !value)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: confirmed }}
          testID="kyc-confirm"
        >
          <Icon
            name={confirmed ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={confirmed ? colors.brand : colors.textMuted}
          />
          <AppText variant="bodySmall" style={styles.confirmText}>
            I confirm these are my own documents and the details are correct.
          </AppText>
        </Pressable>
        <AppText variant="caption" color="textMuted">
          You can’t change your details while they’re being reviewed.
        </AppText>
      </ScrollView>
    </Screen>
  );
}
