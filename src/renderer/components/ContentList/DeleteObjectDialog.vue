<template>
    <modal :id="id" ref="deleteObject"
           v-show="currentWorkingObject" :no-header="true"
           :confirmation-modal="true" :small-modal="true"
    >
        <template slot="header">Copy Object</template>

        <div class="mc-icon">
            <i class="fa fa-exclamation-triangle mci-red"></i>
        </div>

        <div class="mc-text">Are you sure you want to delete?</div>
        <div class="mc-sub">This cannot be undone!</div>


        <template slot="footer">
            <button class="btn btn-danger" @click.prevent="deleteObject">Delete</button>
            <button class="btn btn-link" @click.prevent="cancel">Cancel</button>
        </template>
    </modal>
</template>

<script>
    import EventBus from '../../eventBus'
    import Modal from '../generic/Modal.vue'

    export default {
        name: 'delete-object-dialog',

        components: {
            Modal
        },

        props: {
            currentWorkingObject: {
                required: true
            },
            currentWorkingBucket: {
                required: false,
            },
            id: {
                type: String,
                default: 'deleteObject'
            }
        },

        mounted() {
            $('#deleteObject').on("hidden.bs.modal", () => {
                this.cancel();
            });
        },

        methods: {
            open() {
                this.$refs.deleteObject.open();
            },

            close() {
                this.$refs.deleteObject.close();
            },

            deleteObject() {
                this.$emit('delete', this.target);
            },

            cancel() {
                this.close();
                this.$emit('cancel');
            }
        }
    }
</script>