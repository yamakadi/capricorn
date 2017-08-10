import Vue from 'vue';
import Vuex from 'vuex';
import EventBus from '../eventBus';
import Repository from '../services/aliyun-repository';

Vue.use(Vuex);

export const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state: {
        buckets: [],
        bucketContents: [],
        bucketSize: {},
        usedBucketSize: {},
        currentBucket: null,
        currentFolder: null,
        mappedBucketContents: {},
        mappedBucketContentsInCurrentFolder: []
    },
    getters: {
        bucketSizeForBucket: (state) => (bucketName = null) => {
            if(! bucketName && state.currentBucket) {
                bucketName = state.currentBucket.name;
            }

            if(state.bucketSize[bucketName]) {
                return state.bucketSize[bucketName];
            }

            return 0;
        },
        usedBucketSizeForBucket: (state) => (bucketName = null) => {
            if(! bucketName && state.currentBucket) {
                bucketName = state.currentBucket.name;
            }

            if(state.usedBucketSize[bucketName]) {
                return state.usedBucketSize[bucketName];
            }

            return 0;
        }
    },
    mutations: {
        updateBuckets(state, buckets) {
            state.buckets = buckets;

            if (buckets) {
                buckets.forEach(({name}) => {
                    state.bucketSize[name] = 1099511627776 / 2;
                });
            }

            EventBus.$emit('bucketsHaveBeenLoaded', buckets);
        },

        updateBucketContents(state, objects) {

            if (objects) {
                state.bucketContents = objects;
                state.usedBucketSize[state.currentBucket.name] =
                    state.bucketContents.reduce((total, {size}) => {
                        return total + size;
                    }, 0);
            } else {
                state.bucketContents = [];
                state.usedBucketSize[state.currentBucket.name] = 0;
            }

            EventBus.$emit('bucketContentsHaveChanged', state.bucketContents);
        },

        updateCurrentBucket(state, bucket) {
            Repository.useBucket(bucket);
            state.currentBucket = bucket;

            state.currentFolder = null;
            state.mappedBucketContents = {};
            state.mappedBucketContentsInCurrentFolder = [];

            EventBus.$emit('currentBucketHasChanged', bucket);
        },

        updateCurrentFolder(state, folder) {
            state.currentFolder = folder;

            state.mappedBucketContentsInCurrentFolder = Object.values(
                state.mappedBucketContents[state.currentFolder.realName].children
            );

            EventBus.$emit('currentFolderHasChanged', state.currentFolder, state.currentBucket);
        },

        updateCurrentFolderToRoot(state) {
            state.currentFolder = null;

            state.mappedBucketContentsInCurrentFolder = Object.values(state.mappedBucketContents);

            EventBus.$emit('currentFolderHasChanged', null, state.currentBucket);
        },

        mapBucketContents(state) {
            state.mappedBucketContents = {};

            if (state.bucketContents) {
                state.bucketContents.forEach((object) => {
                    object.type = object.name.endsWith('/') ? 'folder' : 'file';
                    let path = object.name.split('/');

                    if (path.length > 1 && object.type !== 'folder') {
                        object.realName = path.splice(-1, 1).join();
                        object.parent = path.join('/');
                    } else {
                        object.realName = path[0];
                        object.parent = null;
                    }

                    if (object.parent === null) {
                        state.mappedBucketContents[object.realName] = object;
                        state.mappedBucketContents[object.realName].children = [];
                    } else {
                        state.mappedBucketContents[object.parent].children.push(
                            object
                        );
                    }
                });
            }

            state.mappedBucketContentsInCurrentFolder = Object.values(state.mappedBucketContents);
        }
    }

});

export default store;