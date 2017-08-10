<template>
    <modal id="copyObject" ref="copyObject" v-show="currentWorkingObject">
        <template slot="header">Copy Object</template>

        <div class="input-group"><label>Bucket</label>
            <select name="bucket" v-model="target.bucket" class="form-control">
                <option v-for="bucket in buckets" :value="bucket.name">{{ bucket.name }}</option>
            </select>
        </div>

        <div class="input-group copy-text"><label>Name</label>
            <input type="text" required autofocus placeholder="New Name" v-model="target.name">
        </div>


        <template slot="footer">
            <button class="btn btn-success" @click.prevent="copy" :disabled="! target.name">Copy</button>
            <button class="btn btn-link" @click.prevent="cancel">Cancel</button>
        </template>
    </modal>
</template>

<script>
    import EventBus from '../../eventBus'
    import Modal from '../generic/Modal.vue'

    export default {
        name: 'copy-object-dialog',

        components: {
            Modal
        },

        props: {
            currentWorkingObject: {
                required: true
            },
            currentWorkingBucket: {
                required: true,
            }
        },

        data: () => ({
            target: {
                name: null,
                bucket: null
            }
        }),

        computed: {
            buckets() {
                return this.$store.state.buckets;
            }
        },

        watch: {
            currentWorkingObject(value) {
                if(value) {
                    this.target.name = value.realName + '-copy';
                }
            },
            currentWorkingBucket(value) {
                if(value) {
                    this.target.bucket = value.name;
                }
            }
        },

        mounted() {
            $('#copyObject').on("hidden.bs.modal", () => {
                this.cancel();
            });

            if(this.currentWorkingObject) {
                this.target.name = this.currentWorkingObject.realName + '-copy';
            }

            if(this.currentWorkingBucket) {
                this.target.bucket = this.currentWorkingBucket.name;
            }
        },

        methods: {
            open() {
                this.$refs.copyObject.open();
            },

            close() {
                this.target.name = null;
                this.target.bucket = this.currentWorkingBucket.name;

                this.$refs.copyObject.close();
            },

            copy() {
                this.$emit('copy', this.target);
            },

            cancel() {
                this.close();
                this.$emit('cancel');
            }
        }
    }
</script>