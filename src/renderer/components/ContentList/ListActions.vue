<template>
    <div>
        <div class="list-actions" :class="{'list-actions-toggled': this.selectedCount > 0}">
            <span class="la-label">
                <i class="fa fa-check-circle"></i>
                <span></span>

                <span>{{ selectedCount }}</span>
                <span> {{ selectedCount === 1 ? 'Object' : 'Objects' }} selected</span>
            </span>
            <span class="la-actions pull-right">
                <button v-if="false">Download all as zip </button>
            </span>
            <span class="la-actions pull-right">
                <button @click.prevent="showDeleteSelectedObjectsDialog"> Delete selected </button>
            </span>

            <i class="la-close fa fa-times" @click="reset"></i>
        </div>

        <delete-object-dialog id="deleteSelectedObjects" v-show="selectedCount > 0"
                              :currentWorkingObject="selected" ref="deleteSelectedObjects"
                              @delete="deleteSelectedObjects" @cancel=""
        ></delete-object-dialog>

    </div>
</template>

<script>
    import DeleteObjectDialog from './DeleteObjectDialog.vue'
    import Repository from '../../services/aliyun-repository'
    import EventBus from '../../eventBus'

    export default {
        name: 'list-actions',

        components: {
            DeleteObjectDialog
        },

        props: ['selected'],

        data: () => ({
            //
        }),

        computed: {
            selectedCount() {
                if(! this.selected) {
                    return 0;
                }

                return this.selected.length;
            },
            selectedObjectsMappedToBuckets() {
                if(this.selected) {
                    return this.selected.reduce((mapped, object) => {
                        let bucket = (new URL(object.url)).hostname.split('.')[0];

                        if(! mapped.hasOwnProperty(bucket)) {
                            mapped[bucket] = [];
                        }

                        mapped[bucket].push(object);

                        return mapped;
                    }, {})
                }

                return {};
            }
        },

        methods: {
            showDeleteSelectedObjectsDialog() {
                this.$refs.deleteSelectedObjects.open();
            },
            deleteSelectedObjects() {
                for(let bucket in this.selectedObjectsMappedToBuckets) {
                    Repository.deleteMultiple(bucket, this.selectedObjectsMappedToBuckets[bucket]).then(({deleted}) => {
                        new Notification('Deleted!', {
                            body: `All selected objects were deleted`
                        });

                        this.$refs.deleteSelectedObjects.close();
                        this.reset();

                        EventBus.$emit('currentBucketHasChanged');
                    }).catch((error) => {
                        new Notification('Error!', {
                            body: `There was an error while deleting files`
                        });

                        this.$refs.deleteSelectedObjects.close();
                        this.reset();
                        EventBus.$emit('currentBucketHasChanged');
                    })
                }
            },
            reset() {
                this.$emit('reset')
            }
        }
    }
</script>