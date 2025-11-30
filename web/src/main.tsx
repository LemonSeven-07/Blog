// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import 'intersection-observer';

import store from '@/store';
import '@/assets/styles/global.scss';
import RouterContainer from '@/components/RouterContainer';

createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <Provider store={store}>
    <RouterContainer />
  </Provider>
  // </React.StrictMode>
);
