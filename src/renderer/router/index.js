import Vue from 'vue';
import Router from 'vue-router';
import LocalStorage from '../services/localStorage';

Vue.use(Router);

export const router = new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: require('@/components/Home')
        },
        {
            path: '/settings',
            name: 'settings',
            component: require('@/components/Settings')
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
});

router.beforeEach((to, from, next) => {

    if(to.name !== 'settings' && ! LocalStorage.exists('credentials')) {
        next('/settings');
    } else {
        next();
    }

});

export default router;