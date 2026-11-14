import React, { useState } from 'react';
import { View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import {
  AppButton,
  AppText,
  Banner,
  FormInput,
  Screen,
} from '../../../../components';
import type { AppScreenProps } from '../../../../navigation/types';
import { getApiError } from '../../../../utils/apiError';
import { kycQueryKey, useKyc, useSubmitPan } from '../../hooks';
import {
  panFormSchema,
  type PanFormInput,
  type PanFormValues,
} from '../../schemas';
import { styles } from './KycPanScreen.styles';

/** These mean the server's KYC moved on; the details screen shows where it is now. */
const MOVED_ON = new Set(['pan_already_verified', 'kyc_pan_not_expected']);

/**
 * For a PAN that wasn't in DigiLocker or didn't match. The server checks it with the
 * Income Tax Department against the Aadhaar name and date of birth.
 */
export function KycPanScreen({ navigation }: AppScreenProps<'KycPan'>) {
  const queryClient = useQueryClient();
  const kyc = useKyc();
  const submitMutation = useSubmitPan();
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<
    PanFormInput,
    unknown,
    PanFormValues
  >({
    resolver: zodResolver(panFormSchema),
    defaultValues: { pan: '' },
  });

  const onSubmit = handleSubmit(async ({ pan }) => {
    setError(null);
    try {
      const result = await submitMutation.mutateAsync(pan);
      if (result.details?.pan_verified) {
        navigation.popTo('KycDetails');
        return;
      }
      setError(
        result.details?.pan_issue_message ??
          'We couldn’t verify this PAN. Check it and try again.',
      );
    } catch (submitError) {
      const apiError = getApiError(submitError);
      if (MOVED_ON.has(apiError.code)) {
        await queryClient.invalidateQueries({ queryKey: kycQueryKey });
        navigation.popTo('KycDetails');
        return;
      }
      setError(apiError.message);
    }
  });

  const name = kyc.data?.details?.name;
  return (
    <Screen
      scroll
      testID="kyc-pan-screen"
      footer={
        <AppButton
          title="Verify PAN"
          onPress={() => onSubmit()}
          loading={submitMutation.isPending}
          fullWidth
          size="lg"
        />
      }
    >
      <AppText variant="h2" accessibilityRole="header">
        Enter your PAN
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.lead}>
        We’ll check it with the Income Tax Department. The name and date of
        birth on it must match your Aadhaar
        {name ? ` (${name})` : ''}.
      </AppText>
      <View style={styles.form}>
        {error ? (
          <Banner tone="danger" message={error} testID="kyc-pan-error" />
        ) : null}
        <FormInput
          control={control}
          name="pan"
          label="PAN"
          placeholder="ABCPE1234F"
          hint="10 characters, printed on your PAN card"
          leftIcon="card-text-outline"
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          maxLength={12}
          returnKeyType="go"
          onSubmitEditing={() => onSubmit()}
          testID="kyc-pan-input"
        />
      </View>
    </Screen>
  );
}
