// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import 'intersection-observer';

import store from '@/store';
import router from '@/router';
import '@/assets/styles/global.scss';
import FloatingBlock from '@/components/FloatingBlock';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <Provider store={store}>
    <FloatingBlock />
    <RouterProvider router={router} />
  </Provider>
  // </StrictMode>
);
