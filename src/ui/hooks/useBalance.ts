// Copyright 2021 @paritytech/substrate-contracts-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN_ONE, BN_TWO, BN_ZERO, isBn } from '@polkadot/util';
import BN from 'bn.js';
import React from 'react';
import { useFormField } from './useFormField';
import { toBalance, toSats } from 'api/util';
import { useApi } from 'ui/contexts/ApiContext';
import type { UseBalance, Validation } from 'types';

type BitLength = 8 | 16 | 32 | 64 | 128 | 256;

const DEFAULT_BITLENGTH = 128;

interface ValidateOptions {
  bitLength?: BitLength;
  isZeroable?: boolean;
  maxValue?: BN;
}

function getGlobalMaxValue(bitLength?: number): BN {
  return BN_TWO.pow(new BN(bitLength || DEFAULT_BITLENGTH)).isub(BN_ONE);
}

function validate(
  value: BN | null | undefined,
  { bitLength = DEFAULT_BITLENGTH, isZeroable, maxValue }: ValidateOptions
): Validation {
  let validation: React.ReactNode;
  let isError = false;

  if (!value) {
    isError = true;
    return {
      isError,
    };
  }

  if (value?.lt(BN_ZERO)) {
    isError = true;
    validation = 'Value cannot be negative';
  }

  if (value?.gt(getGlobalMaxValue(bitLength))) {
    isError = true;
    validation = 'Value exceeds global maximum';
  }

  if (!isZeroable && value?.isZero()) {
    isError = true;
    validation = 'Value cannot be zero';
  }

  if (value && value?.bitLength() > (bitLength || DEFAULT_BITLENGTH)) {
    isError = true;
    validation = "Value's bitlength is too high";
  }

  if (maxValue && maxValue.gtn(0) && value?.gt(maxValue)) {
    isError = true;
    validation = `Value cannot exceed ${maxValue?.toNumber()}`;
  }

  return {
    isError,
    isValid: !isError,
    validation,
  };
}

export function useBalance(
  initialValue: BN | string | number = 0,
  isZeroable = false,
  maxValue?: BN
): UseBalance {
  const { api } = useApi();
  const balance = useFormField<BN | null | undefined>(
    isBn(initialValue) ? toSats(api, initialValue) : toBalance(api, initialValue),
    value => validate(value, { isZeroable, maxValue })
  );

  return balance;
}
