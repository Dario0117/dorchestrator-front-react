import { initializeTracing } from '@lib/observability/tracer';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import { QueryProvider } from '@domains/shared/context/query.provider';
import { ThemeProvider } from '@domains/shared/context/theme.provider';
import App from '@/app';

initializeTracing();

const rootElement = document.getElementById('root') as Element;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider
        defaultTheme="system"
        storageKey="core-ui-theme"
      >
        <QueryProvider>
          <App />
          <ReactQueryDevtools />
        </QueryProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}
