<template>
    <div class="alert alert-info progress animated fadeInUp" v-if="object && progress">
        <button type="button" class="close" @click.prevent="abort">
            <span>×</span>
        </button>

        <div class="text-center">
            <small>Uploading '{{ object.realName }}'...</small>
        </div>

        <div class="progress">
            <div class="progress-bar"
                 role="progressbar"
                 :style="{width: progress.percentage +'%'}"
                 :aria-valuenow="progress.percentage"
                 aria-valuemin="0"
                 aria-valuemax="100"
            ></div>
        </div>

        <div class="text-center">
            <small>
                <span>{{ $humanize.filesize(progress.transferred) }}</span>
                <span> of </span>
                <span>{{ $humanize.filesize(progress.length) }}</span>
                <span> (</span>
                <span>{{ $humanize.numberFormat(progress.percentage)}}</span>
                <span> %)</span>
            </small>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'progress-indicator',
        props: {
            object: {
                required: true
            },
            progress: {
                required: true
            },
        },

        data: () => ({
            //
        }),

        methods: {
            abort() {
                this.$emit('abort');
            }
        }
    }
</script>