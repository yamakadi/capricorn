<template>
    <div role="dialog">
        <div class="modal" :class="{'modal-confirm': confirmationModal, 'modal-create-bucket': relativeModal}" role="dialog" tabindex="-1" :id="id">
            <div class="modal-dialog" :class="{'modal-sm': smallModal}">
                <div class="modal-content" role="document">
                    <div class="modal-header" v-if="! noHeader">
                        <slot name="header"></slot>
                        <button class="close close-alt" @click="close"><span>×</span></button>
                    </div>

                    <button class="close close-alt" @click="close" v-else><span>×</span></button>

                    <div class="modal-body">
                        <slot></slot>
                    </div>
                    <div class="modal-footer" v-if="! noFooter">
                        <slot name="footer"></slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'modal',
        props: {
            id: {
                required: true
            },
            noHeader: {
                type: Boolean,
                default: false
            },
            noFooter: {
                type: Boolean,
                default: false
            },
            smallModal: {
                type: Boolean,
                default: false
            },
            confirmationModal: {
                type: Boolean,
                default: false
            },
            relativeModal: {
                type: Boolean,
                default: false
            }
        },

        data: () => ({
            self: null
        }),

        mounted() {
            this.self = $('#' + this.id);
        },

        methods: {
            open() {
                this.self.modal('show');
            },

            close() {
                this.self.modal('hide');
            }
        }
    }

</script>