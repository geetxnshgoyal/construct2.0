export const isRegistrationClosed = (): boolean => {
  return true;
};

export const isSubmissionClosed = (): boolean => {
  const closedFlag = import.meta.env.VITE_SUBMISSION_CLOSED;
  if (typeof closedFlag === 'string') {
    return closedFlag.toLowerCase() === 'true';
  }

  const openFlag = import.meta.env.VITE_SUBMISSION_OPEN;
  if (typeof openFlag === 'string') {
    return openFlag.toLowerCase() === 'false';
  }

  return true;
};
