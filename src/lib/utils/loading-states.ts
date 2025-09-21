export interface LoadingState {
  isLoading: boolean;
  error: unknown;
  data?: unknown;
}

export interface AsyncState<T> extends LoadingState {
  data?: T;
  isSuccess: boolean;
  isError: boolean;
}

export const createAsyncState = <T>(
  isLoading: boolean,
  error: unknown = null,
  data?: T
): AsyncState<T> => ({
  isLoading,
  error,
  data,
  isSuccess: !isLoading && !error && data !== undefined,
  isError: !isLoading && !!error,
});

export const createLoadingState = (isLoading = false): LoadingState => ({
  isLoading,
  error: null,
});

export const createErrorState = (error: unknown): LoadingState => ({
  isLoading: false,
  error,
});

export const createSuccessState = <T>(data: T): AsyncState<T> => ({
  isLoading: false,
  error: null,
  data,
  isSuccess: true,
  isError: false,
});

// Utility to combine multiple loading states
export const combineLoadingStates = (...states: LoadingState[]): LoadingState => {
  const isLoading = states.some(state => state.isLoading);
  const errors = states.filter(state => state.error).map(state => state.error);
  
  return {
    isLoading,
    error: errors.length > 0 ? errors[0] : null,
  };
};

// Utility to check if any states are loading
export const isAnyLoading = (...states: LoadingState[]): boolean => {
  return states.some(state => state.isLoading);
};

// Utility to check if all states are loaded (not loading and no errors)
export const areAllLoaded = (...states: LoadingState[]): boolean => {
  return states.every(state => !state.isLoading && !state.error);
};

// Utility to get the first error from multiple states
export const getFirstError = (...states: LoadingState[]): unknown => {
  const errorState = states.find(state => state.error);
  return errorState?.error || null;
};