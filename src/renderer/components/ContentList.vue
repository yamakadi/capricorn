<template>
    <div>
        <list-actions :selected="selectedObjects" @reset="resetSelectedObjects"></list-actions>
        <div class="feb-container">
            <header class="fesl-row" data-type="folder">
                <div class="fesl-item fesl-item-icon"></div>
                <div class="fesl-item fesl-item-name" data-sort="name">
                    <span>Name</span><i class="fesli-sort fa fa-sort-alpha-asc"></i>
                </div>
                <div class="fesl-item fesl-item-size" data-sort="size">
                    <span>Size</span><i class="fesli-sort fa fa-sort-amount-asc"></i>
                </div>
                <div class="fesl-item fesl-item-modified" data-sort="last-modified">
                    <span>Last Modified</span><i class="fesli-sort fa fa-sort-numeric-asc"></i>
                </div>
                <div class="fesl-item fesl-item-actions"></div>
            </header>
        </div>

        <div class="feb-container"
             v-if="mappedBucketContentsInCurrentFolder && mappedBucketContentsInCurrentFolder.length > 0">
            <div class="fesl-row" v-for="object in mappedBucketContentsInCurrentFolder"
                 :class="{'fesl-row-selected': isObjectSelected(object)}"
                 :data-type="object.type === 'folder' ? 'folder' : 'other'"
            >
                <div class="fesl-item fesl-item-icon">
                    <div class="fi-select">
                        <input type="checkbox" v-if="object.type !== 'folder'" :name="object.name" :value="object" v-model="selectedObjects"/>
                        <i class="fis-icon"></i>
                        <i class="fis-helper"></i>
                    </div>
                </div>

                <div class="fesl-item fesl-item-name">
                    <a href="#" @click.prevent="object.type === 'folder' ? openFolder(object) : saveObject(object)">
                        {{ object.realName }}
                    </a>
                </div>

                <div class="fesl-item fesl-item-size">
                    {{ object.type === 'folder' ? '-' : $humanize.filesize(object.size) }}


                </div>

                <div class="fesl-item fesl-item-modified">
                    {{ object.type === 'folder' ? '-' : $moment(object.lastModified).format('lll') }}


                </div>

                <div class="fesl-item fesl-item-actions">
                    <div class="dropdown btn-group">
                        <button class="dropdown-toggle fia-toggle btn btn-default" :id="object.realName"
                                type="button" aria-haspopup="true" aria-expanded="false" data-toggle="dropdown">
                        </button>
                        <ul class="dropdown-menu" role="menu" :aria-labelledby="object.realName">
                            <a href="" class="fiad-action" v-if="object.type !== 'folder'" @click.prevent="showShareObjectDialog(object)"><i
                                    class="fa fa-share-alt"></i></a>
                            <a href="" class="fiad-action" @click.prevent="showCopyObjectDialog(object)"><i
                                    class="fa fa-files-o"></i></a>
                            <a href="" class="fiad-action" @click.prevent="showDeleteObjectDialog(object)"><i
                                    class="fa fa-trash"></i></a>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="bucketContents && bucketContents.length === 0">
            <div class="fesl-row">
                <div class="fesl-item fesl-item-icon"></div>

                <div class="fesl-item fesl-item-name">
                    There are no objects in this bucket.

                </div>

                <div class="fesl-item fesl-item-size"></div>
                <div class="fesl-item fesl-item-modified"></div>
                <div class="fesl-item fesl-item-actions"></div>
            </div>
        </div>


        <progress-indicator :object="currentWorkingObject" :progress="currentDownload.progress"
                            @abort="abortSavingObject"></progress-indicator>

        <share-object-dialog ref="shareObject" v-show="currentWorkingObject"
                            :currentWorkingObject="currentWorkingObject"
        ></share-object-dialog>

        <copy-object-dialog ref="copyObject" v-show="currentWorkingObject"
                            :currentWorkingObject="currentWorkingObject"
                            :currentWorkingBucket="currentWorkingBucket"
                            @copy="copyObject" @cancel=""
        ></copy-object-dialog>

        <delete-object-dialog ref="deleteObject" v-show="currentWorkingObject"
                              :currentWorkingObject="currentWorkingObject"
                              :currentWorkingBucket="currentWorkingBucket"
                              @delete="deleteObject" @cancel=""
        ></delete-object-dialog>
    </div>
</template>

<script>
    import EventBus from '../eventBus'
    import Modal from './generic/Modal.vue'
    import CopyObjectDialog from './ContentList/CopyObjectDialog.vue'
    import ShareObjectDialog from './ContentList/ShareObjectDialog.vue'
    import DeleteObjectDialog from './ContentList/DeleteObjectDialog.vue'
    import Repository from '../services/aliyun-repository'
    import Filesystem from '../filesystem/index'
    import * as fs from 'fs'
    import ProgressIndicator from './ContentList/ProgressIndicator.vue'
    import ListActions from './ContentList/ListActions.vue'

    export default {
        name: 'content-list',

        components: {
            Modal,
            CopyObjectDialog,
            ShareObjectDialog,
            DeleteObjectDialog,
            ProgressIndicator,
            ListActions
        },

        data: () => ({
            currentWorkingObject: null,
            currentDownload: {
                progress: null,
                path: null,
                file: null
            },
            selectedObjects: []
        }),

        computed: {
            currentWorkingBucket() {
                return this.$store.state.currentBucket;
            },
            bucketContents() {
                return this.$store.state.bucketContents;
            },
            mappedBucketContentsInCurrentFolder() {
                return this.$store.state.mappedBucketContentsInCurrentFolder;
            }
        },

        watch:{
            selectedObjects(value) {}
        },

        mounted() {
            EventBus.$on('abortSavingObject', (object, {path, file}) => {
                file.stream.destroy();

                fs.unlink(path, () => {});

                new Notification('Aborted!', {
                    body: `Download of '${object.realName}' has been aborted.`
                });
            });
        },

        methods: {
            resetSelectedObjects() {
                this.selectedObjects = [];
            },
            openFolder(object) {
                this.$store.commit('updateCurrentFolder', object);
            },
            showShareObjectDialog(object) {
                this.currentWorkingObject = object;
                this.$refs.shareObject.open();
            },
            showCopyObjectDialog(object) {
                this.currentWorkingObject = object;
                this.$refs.copyObject.open();
            },
            copyObject(target) {
                let path = this.currentWorkingBucket.name !== target.bucket
                    ? `/${target.bucket}/${target.name}`
                    : `${target.name}`;

                if (this.currentWorkingObject.type === 'folder') {
                    target.name += '/';
                }

                let source = `/${this.currentWorkingBucket.name}/${this.currentWorkingObject.name}`;

                Repository.copy(target, source).then(() => {
                    new Notification('Copied!', {
                        body: `'${source}' has been copied to '${path}'`
                    });

                    this.$refs.copyObject.close();
                    EventBus.$emit('currentBucketHasChanged');

                }).catch(() => {
                    new Notification('Error!', {
                        body: `There was an error while copying '${source}' to '${path}'`
                    });

                    this.$refs.copyObject.close();
                    EventBus.$emit('currentBucketHasChanged');
                });
            },
            showDeleteObjectDialog(object) {
                this.currentWorkingObject = object;
                this.$refs.deleteObject.open();
            },
            deleteObject() {
                if (this.currentWorkingObject.type === 'folder' && this.currentWorkingObject.children.length > 0) {

                    new Notification('Error!', {
                        body: `The folder you tried to delete is not empty.`
                    });

                    this.$refs.deleteObject.close();

                } else {
                    Repository.delete(this.currentWorkingObject).then(() => {
                        new Notification('Deleted!', {
                            body: `'${this.currentWorkingObject.realName}' has been deleted`
                        });

                        this.$refs.deleteObject.close();

                        EventBus.$emit('currentBucketHasChanged');
                    })
                }
            },
            saveObject(object) {
                this.currentWorkingObject = object;

                Repository.get(this.currentWorkingObject).then((file) => {
                    this.currentDownload.path = Filesystem.getSavePathThroughDialog(object.realName);
                    this.currentDownload.file = file;

                    Filesystem.saveFileStreamToPath(this.currentDownload.path, this.currentDownload.file.stream,
                        (progress) => {
                            this.currentDownload.progress = progress;

                            if (this.currentDownload.progress.percentage === 100 &&
                                this.currentDownload.progress.remaining === 0) {
                                new Notification('Completed!', {
                                    body: `Your file has been downloaded.`
                                });
                            }

                            if (this.currentDownload.progress.percentage === 100) {
                                this.currentWorkingObject = null;
                                this.currentDownload.progress = null;
                            }
                        })

                }).catch((error) => {
                    this.currentWorkingObject = null;
                    this.currentDownload.progress = null;
                    this.currentDownload.path = null;
                    this.currentDownload.file = null;

                    new Notification('Error!', {
                        body: `${error.message}`
                    });
                });
            },
            abortSavingObject() {
                EventBus.$emit('abortSavingObject', this.currentWorkingObject, this.currentDownload);
            },
            isObjectSelected(object) {
                return !! this.selectedObjects.find((selected) => {
                    return selected.name === object.name;
                })
            }
        }
    }
</script>