// Copyright 2021 @paritytech/substrate-contracts-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Reducer } from 'react';
import { ContractCallState, ContractCallAction } from 'types';

export const initialState: ContractCallState = {
  isLoading: false,
  isSuccess: false,
  results: [],
};

export const contractCallReducer: Reducer<ContractCallState, ContractCallAction> = (
  state,
  action
) => {
  switch (action.type) {
    case 'CALL_INIT':
      return {
        ...state,
        isLoading: true,
        results: [
          ...state.results,
          {
            ...action.payload,
            isComplete: false,
          },
        ],
      };

    case 'CALL_FINALISED':
      return {
        ...state,
        isSuccess: true,
        results: state.results.map(result =>
          action.payload.id === result.id
            ? {
                ...result,
                ...action.payload,
                isComplete: true,
              }
            : result
        ),
        isLoading: false,
      };

    case 'RESET':
      return initialState;

    default:
      throw new Error();
  }
};
