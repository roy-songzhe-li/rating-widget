import './app.css'
import './lib/rating-widget'
import App from './App.svelte'

// Mount the App component
const app = document.createElement('div');
app.id = 'app';
document.body.appendChild(app);

const appInstance = new App({
  target: document.getElementById('app')!,
});

export default appInstance;
