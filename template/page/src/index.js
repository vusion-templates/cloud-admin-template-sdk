import '@/global/styles/theme.css';

import platformConfig from '../../../platform.config.json';
import Vue from 'vue';
import App from './index.vue';
import { initRouter } from './router';
import '@/global/features/page-init';
import './library';
import '@/global/styles/index.css';
import installServices from '@/global/features/service/install';
import installUtils from '@/global/features/utils/install';
import micro from './micro';
import appConfig from './app.config';
import { initMiddleware } from '@/global/middleware';
import { apolloProvider } from '@/global/features/apollo'
import GueryStrCollect from '@/global/features/apollo/queryStrCollect'

// import { initI18n } from '@/global/page/i18n';
window.appInfo = Object.assign(appConfig, platformConfig);
Vue.use(installServices);
Vue.use(installUtils);
Vue.use(GueryStrCollect);

initMiddleware(appConfig);
if (window.microApp && window.microApp.isMicro) {
    micro.init(initRouter);
} else {
    const app = new Vue({
        name: 'app',
        apolloProvider,
        router: initRouter(),
        ...App,
        // i18n: initI18n(),
    });
    app.$mount('#app');
}

