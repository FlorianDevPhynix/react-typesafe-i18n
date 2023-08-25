import React from 'react';
import ReactDOM from 'react-dom/client';

import I18nProvider from './i18n';

import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<React.Suspense fallback={<h2>Loading...</h2>}>
			<I18nProvider>
				<App />
			</I18nProvider>
		</React.Suspense>
	</React.StrictMode>
);
