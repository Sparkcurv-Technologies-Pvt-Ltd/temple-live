import { setCredentials } from '../modules/Auth/authSlice';
import { store } from '../store';

export const SetCredentialsFunction = (data) => {
  const credentialsData = {
    ...data,
  };
  // Dispatch the setCredentials action with the credentials data
  store.dispatch(setCredentials(credentialsData));
};