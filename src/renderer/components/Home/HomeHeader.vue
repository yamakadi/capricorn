<template>
    <header class="fe-header">
        <h2>
                <span class="main">
                    <a href="#" @click.prevent="updateCurrentFolderToRoot">
                        {{ currentBucket ? currentBucket.name : 'Home' }}
                    </a>
                </span>
            <span v-if="currentFolder">
                    <a href="#" @click.prevent="">
                        {{ currentFolder ? currentFolder.realName : '' }}
                    </a>
                </span>
        </h2>
        <div class="feh-usage">
            <div class="fehu-chart">
                <div :style="{width: usedBucketSizePercentage + '%'}"></div>
            </div>
            <ul>
                <li>
                    <span>Used: </span>
                    <span>{{ $humanize.filesize(usedBucketSize) }}</span>
                </li>
                <li class="pull-right">
                    <span>Free: </span>
                    <span>{{ $humanize.filesize(remainingBucketSize) }}</span>
                </li>
            </ul>
        </div>
        <ul class="feh-actions">
            <li>
                <div class="dropdown btn-group">
                    <button id="top-right-menu" class="dropdown-toggle btn btn-default" data-toggle="dropdown" type="button" aria-haspopup="true" aria-expanded="false">
                        <i class="fa fa-reorder"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-right" role="menu" aria-labelledby="top-right-menu">
                        <li>
                            <a href @click.prevent="toggleFullscreenMode" >Fullscreen <i class="fa fa-expand"></i></a>
                        </li>
                        <li>
                            <router-link to="settings" >Settings <i class="fa fa-cog"></i></router-link>
                        </li>
                    </ul>
                </div>
            </li>
        </ul>
    </header>
</template>

<script>
    import EventBus from '../../eventBus'

    export default {
        name: 'home-header',

        data: () => ({
            //
        }),

        computed: {
            currentBucket() {
                return this.$store.state.currentBucket;
            },
            currentFolder() {
                return this.$store.state.currentFolder;
            },
            bucketSize() {
                return this.$store.getters.bucketSizeForBucket()
            },
            usedBucketSize() {
                return this.$store.getters.usedBucketSizeForBucket()
            },
            remainingBucketSize() {
                return this.bucketSize - this.usedBucketSize;
            },
            usedBucketSizePercentage() {
                return ((this.usedBucketSize * 100) / this.bucketSize);
            }
        },

        methods: {
            toggleFullscreenMode() {
                this.$electron.remote.getCurrentWindow().setFullScreen(
                    ! this.$electron.remote.getCurrentWindow().isFullScreen()
                );
            },

            updateCurrentFolderToRoot() {
                EventBus.$emit('updateCurrentFolderToRoot');
            }
        }
    }
</script>