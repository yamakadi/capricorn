<template>
    <modal id="shareObject" ref="shareObject" v-show="currentWorkingObject">
        <template slot="header">Share Object</template>

        <div class="input-group copy-text"><label>Shareable Link (Valid for 24 hours)</label>
            <input type="text" placeholder="http://" :value="signedLink">
        </div>

        <template slot="footer">
            <button class="btn btn-success" @click.prevent="copyLink">Copy Link</button>
            <button class="btn btn-link" @click.prevent="cancel">Cancel</button>
        </template>
    </modal>
</template>

<script>
    import Modal from '../generic/Modal.vue'
    import Repository from '../../services/aliyun-repository'

    export default {
        name: 'share-object-dialog',

        props: {
            currentWorkingObject: {
                required: true
            }
        },

        components: {
            Modal
        },

        computed: {
            signedLink: {
                get() {
                    if(this.currentWorkingObject) {
                        return Repository.signedUrl(this.currentWorkingObject, {
                            expires: 86400
                        });
                    }

                    return '';
                },

                set(value) {
                    console.log(arguments);
                }
            }

        },

        methods: {
            open() {
                this.$refs.shareObject.open();
            },

            close() {
                this.signedLink = '';
                this.$refs.shareObject.close();
            },

            copyLink() {
                this.$electron.remote.clipboard.writeText(this.signedLink);

                new Notification('Copied!', {
                    boy: 'Shareable link has been copied to the clipboard.'
                });

                this.$refs.shareObject.close();
            },

            cancel() {
                this.close();
            }
        }
    }
</script>