<template>
    <div v-cloak>
        <div class="page-load v-cloak--inline">
            <div class="pl-inner">
                <img src="~@/assets/logo.png" alt="">
            </div>
        </div>
        <div v-if="$route.name === 'settings'">
            <router-view></router-view>
        </div>
        <div id="app" class="v-cloak--hidden" v-else>
            <div class="file-explorer">
                <sidebar></sidebar>
                <div class="fe-body">
                    <router-view></router-view>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import store from './store'
    import Repository from './services/aliyun-repository'
    import EventBus from './eventBus';
    import LocalStorage from './services/localStorage';
    import Sidebar from './components/Sidebar.vue';

    export default {
        name: 'capricorn',
        store: store,

        components: {
            Sidebar
        },

        computed: {
            currentBucketContents() {
                return this.$store.state.bucketContents;
            }
        },

        watch: {
            currentBucketContents(objects) {
                this.$store.commit('mapBucketContents');
            }
        },

        mounted() {
            this.updateBuckets();

            EventBus.$on('bucketsHaveChanged', () => {
                this.updateBuckets();
            });

            EventBus.$on('currentBucketHasChanged', () => {
                this.updateBucketContents();
            });

            EventBus.$on('currentFolderHasChanged', (object, bucket) => {
                //
            });

            EventBus.$on('updateCurrentFolderToRoot', () => {
                this.$store.commit('updateCurrentFolderToRoot');
            });
        },

        methods: {
            updateBuckets() {
                Repository.listBuckets().then(({buckets}) => {
                    this.$store.commit('updateBuckets', buckets);
                    this.$store.commit('updateCurrentBucket', LocalStorage.get('defaultBucket'));
                });
            },

            updateBucketContents() {
                Repository.listObjects().then(({objects}) => {
                    this.$store.commit('updateBucketContents', objects);
                });
            }
        }
    }
</script>

<style lang="less">
    @import "assets/less/main";
    @import "assets/less/globals";
</style>
