<template>
    <Scrollbar :settings="{}">
        <home-header></home-header>
        <content-list></content-list>
        <home-actions></home-actions>
    </Scrollbar>
</template>

<script>
    import Modal from './generic/Modal.vue'
    import EventBus from '../eventBus'
    import Scrollbar from 'vue-perfect-scrollbar'
    import ContentList from './ContentList.vue'
    import HomeHeader from './Home/HomeHeader.vue'
    import HomeActions from './Home/HomeActions.vue'

    export default {
        name: 'home',

        components: {
            Modal,
            Scrollbar,
            ContentList,
            HomeHeader,
            HomeActions,
        },

        computed: {

        },

        methods: {
        }
    }
</script>