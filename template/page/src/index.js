import platformConfig from '../../../platform.config.json';
import appConfig from './app.config';
import designer from '@/global/features/designer';
import rootRoute from './routes.map.js?rootPath=/';
designer.init(appConfig, platformConfig, rootRoute);
