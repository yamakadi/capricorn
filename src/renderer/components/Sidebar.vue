<template>
    <div>
        <div class="fe-sidebar">
            <div class="fes-header clearfix hidden-sm hidden-xs">
                <img src="~@/assets/logo.png" alt="">
                <h2>Capricorn</h2>
            </div>

            <div class="fes-list">
                <div class="input-group ig-dark ig-left ig-search" style="display:block;">
                    <input class="ig-text" type="text" placeholder="Search Buckets..." v-model="searchQuery">
                    <i class="ig-helpers"></i>
                </div>

                <Scrollbar class="fesl-inner" :settings="{}">
                    <ul>
                        <li v-for="bucket in filteredBuckets" :class="{'active': bucket.name === currentBucket.name}">
                            <a href="#"
                               @click.prevent="updateCurrentBucket(bucket)"
                            >
                                {{ bucket.name }}
                            </a>
                            <i class="fesli-trigger" @click="showDeleteBucketDialog(bucket)"></i>
                        </li>
                    </ul>
                </Scrollbar>
            </div>

            <div class="fes-host">
                <i class="fa fa-home"></i>
                <a href="/" @click.prevent="reload">Home</a>
            </div>

        </div>
        <modal id="deleteBucket" ref="deleteBucket"
               v-show="currentWorkingBucket" :no-header="true"
               :confirmation-modal="true" :small-modal="true"
        >
            <template slot="header">Copy Object</template>

            <div class="mc-icon">
                <i class="fa fa-exclamation-triangle mci-red"></i>
            </div>

            <div class="mc-text">Are you sure you want to delete bucket?</div>
            <div class="mc-sub">This cannot be undone and all the files will be deleted!</div>

            <template slot="footer">
                <button class="btn btn-danger" @click.prevent="deleteBucket">Delete</button>
                <button class="btn btn-link" @click.prevent="cancelDeletingBucket">Cancel</button>
            </template>
        </modal>
    </div>
</template>

<script>
    import Scrollbar from 'vue-perfect-scrollbar'
    import EventBus from '../eventBus';
    import Modal from './generic/Modal.vue'
    import Repository from '../services/aliyun-repository'

    export default {
        name: 'sidebar',
        components: {
            Modal,
            Scrollbar
        },
        data: () => ({
            searchQuery: '',
            currentWorkingBucket: ''
        }),
        computed: {
            buckets() {
                return this.$store.state.buckets;
            },
            currentBucket() {
                return this.$store.state.currentBucket;
            },
            filteredBuckets() {
                return this.buckets.filter((bucket) => {
                    return bucket.name.indexOf(this.searchQuery) !== -1
                });
            }
        },
        methods: {
            reload() {
                this.$electron.remote.getCurrentWindow().reload();
            },
            showDeleteBucketDialog(bucket) {
                this.currentWorkingBucket = bucket;
                this.$refs.deleteBucket.open();
            },
            deleteBucket() {
                if(this.$store.getters.usedBucketSizeForBucket(this.currentWorkingBucket.name) > 0) {

                    new Notification('Error!', {
                        body: `The bucket you tried to delete is not empty.`
                    });

                    this.cancelDeletingBucket();
                } else {

                    Repository.deleteBucket(this.currentWorkingBucket).then(() => {
                        this.$refs.deleteBucket.close();

                        new Notification('Deleted!', {
                            body: `Successfully deleted bucket.`
                        });

                        EventBus.$emit('bucketsHaveChanged');

                    }).catch((error) => {
                        this.$refs.deleteBucket.close();

                        new Notification('Error!', {
                            body: `${error.message}`
                        });
                    });

                }
            },
            cancelDeletingBucket() {
                this.currentWorkingBucket = '';
                this.$refs.deleteBucket.close();
            },
            updateCurrentBucket(bucket) {
                this.$store.commit('updateCurrentBucket', bucket);
            }
        }
    }
</script>