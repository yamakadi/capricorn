<template>
    <div>

        <div class="feb-actions dropup btn-group">
            <button class="dropdown-toggle feba-toggle btn btn-default" id="fe-action-toggle" type="button"
                    aria-haspopup="true" aria-expanded="false" data-toggle="dropdown"
            >
                <span><i class="fa fa-plus"></i></span>
            </button>

            <ul class="dropdown-menu" role="menu" aria-labelledby="fe-action-toggle">
                <a href="#" @click.prevent="uploadNewObject" class="feba-btn feba-upload" aria-describedby="tt-upload-file">
                    <i class="fa fa-cloud-upload"></i>
                </a>
                <a href="#" @click.prevent="openNewFolderDialog" class="feba-btn feba-bucket" aria-describedby="tt-create-bucket">
                    <i class="fa fa-folder-o"></i>
                </a>
                <a href="#" @click.prevent="openNewBucketDialog" class="feba-btn feba-bucket" aria-describedby="tt-create-bucket">
                    <i class="fa fa-hdd-o"></i>
                </a>
            </ul>
        </div>

        <modal id="newBucket" ref="newBucket" :no-header="true" :no-footer="true" :relative-modal="true" :small-modal="true">
            <div class="input-group">
                <input class="ig-text" type="text" autofocus placeholder="Bucket Name" v-model="newBucket.name" @keydown.enter="addNewBucket">
                <i class="ig-helpers"></i>
            </div>
        </modal>

        <modal id="newFolder" ref="newFolder" :no-header="true" :no-footer="true" :relative-modal="true" :small-modal="true">
            <div class="input-group">
                <input class="ig-text" type="text" autofocus placeholder="Folder Name" v-model="newFolder.name" @keydown.enter="addNewFolder">
                <i class="ig-helpers"></i>
            </div>
        </modal>

        <upload-progress-indicator :object="currentWorkingObject" :progress="upload.progress" @abort="abortUploadingNewObject"></upload-progress-indicator>

    </div>
</template>

<script>
    import Modal from '../generic/Modal.vue'
    import Repository from '../../services/aliyun-repository'
    import UploadProgressIndicator from './UploadProgressIndicator.vue'
    import EventBus from '../../eventBus'
    import Filesystem from '../../filesystem/index'
    import * as fs from 'fs'
    import {basename}　from 'path'
    import {ProgressStream} from '../../filesystem/progress-stream';

    export default {
        name: 'home-actions',

        components: {
            Modal,
            UploadProgressIndicator
        },

        data: () => ({
            newBucket: {
                name: ''
            },
            newFolder: {
                name: ''
            },
            currentWorkingObject: {},
            upload: {
                progress: null,
                path: null,
                file: null,
                stats: null
            }
        }),

        computed: {
            currentFolder() {
                return this.$store.state.currentFolder;
            }
        },

        mounted() {
            EventBus.$on('abortUploadingNewObject', (stream) => {
                stream.destroy();

                this.currentWorkingObject = {};
                this.upload.progress = null;
                this.upload.path = null;
                this.upload.file = null;
                this.upload.stats = null;

                new Notification('Aborted!', {
                    body: `Upload has been aborted.`
                });
            })
        },

        methods: {
            openNewBucketDialog() {
                this.$refs.newBucket.open();
            },
            addNewBucket() {
                Repository.putBucket(this.newBucket.name).then(() => {
                    this.$refs.newBucket.close();

                    new Notification('Created!', {
                        body: `'${this.newBucket.name}' has been created`
                    });

                    EventBus.$emit('bucketsHaveChanged');

                    this.newBucket.name = '';
                }).catch((error) => {
                    this.$refs.newBucket.close();

                    new Notification('Error!', {
                        body: `${error.message}`
                    });

                    this.newBucket.name = '';
                })
            },
            openNewFolderDialog() {
                this.$refs.newFolder.open();
            },
            addNewFolder() {
                Repository.putFolder(this.newFolder.name).then((folder) => {
                    this.$refs.newFolder.close();

                    new Notification('Created!', {
                        body: `'${this.newFolder.name}' has been created`
                    });

                    EventBus.$emit('bucketsHaveChanged');

                    this.newFolder.name = '';
                }).catch((error) => {
                    this.$refs.newFolder.close();

                    new Notification('Error!', {
                        body: `${error.message}`
                    });

                    this.newFolder.name = '';
                })
            },
            uploadNewObject() {
                this.upload.path = Filesystem.openFileThroughDialog();

                if(! this.upload.path) {
                    new Notification('Error', {
                        body: `You haven't selected a file to upload`
                    });

                    return;
                }

                this.upload.file = fs.createReadStream(this.upload.path);
                this.upload.stats = fs.statSync(this.upload.path);
                this.currentWorkingObject.realName = basename(this.upload.path);

                let uploadPath = this.currentWorkingObject.realName;

                if(this.currentFolder) {
                    uploadPath = `${this.currentFolder.realName}/${uploadPath}`;
                }

                let progress = new ProgressStream({
                    length: this.upload.stats.size,
                    time: 500
                }, (progress) => {
                    this.upload.progress = progress;
                });

                let stream = this.upload.file.pipe(progress.through);

                Repository.put(uploadPath, stream, {contentLength: this.upload.stats.size}).then((object) => {
                    new Notification('Completed!', {
                        body: `Your file has been uploaded.`
                    });

                    this.currentWorkingObject = {};
                    this.upload.progress = null;
                    this.upload.path = null;
                    this.upload.file = null;
                    this.upload.stats = null;

                    EventBus.$emit('currentBucketHasChanged');
                }).catch(function(err) {
                    console.log('error: %j', err);
                });

            },
            abortUploadingNewObject() {
                EventBus.$emit('abortUploadingNewObject', this.upload.file);
            }
        }
    }
</script>