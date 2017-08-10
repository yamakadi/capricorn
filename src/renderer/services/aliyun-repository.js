import Client from './aliyun-oss';

export class AliyunRepository {
    /**
     * @param client
     */
    constructor(client) {
        this.client = client;

        this.previousBucket = null;
    }

    get currentBucket() {
        return {
            name: this.client.options.bucket,
            region: this.client.options.region,
        }
    }

    putBucket(name) {
        return this.client.putBucket(name, this.currentBucket.region);
    }

    deleteBucket({name, region}) {
        return this.client.deleteBucket(name, region);
    }

    useBucket({name, region}) {
        this.previousBucket = this.currentBucket;

        this.client = this.client.useBucket(name, region);
    }

    useBucketByName(name) {
        this.previousBucket = this.currentBucket;
        this.client = this.client.useBucket(name, this.currentBucket.region);
    }

    listBuckets() {
        return this.client.listBuckets().catch(function(err) {
            console.log('error: %j', err);
        });
    }

    listObjects() {
        return this.client.list().catch(function(err) {
            console.log('error: %j', err);
        });
    }

    get({name}) {
        return this.client.getStream(name).catch(function(err) {
            console.log('error: %j', err);
        });
    }

    url({name}) {
        return this.client.getObjectUrl(name);
    }

    signedUrl({name}, options = {}) {
        return this.client.signatureUrl(name, options);
    }

    put(name, stream, options = {}) {
        return this.client.putStream(name, stream, options);
    }

    putFolder(name, options = {}) {
        return this.client.put(name + '/', new Buffer(''), options).catch(function(err) {
            console.log('error: %j', err);
        });
    }

    delete({name}) {
        return this.client.delete(name).catch(function(err) {
            console.log('error: %j', err);
        });
    }

    deleteMultiple(bucket, objects) {
        this.useBucketByName(bucket);
        let objectNames = objects.map(object => object.name);

        return this.client.deleteMulti(objectNames);
    }

    copy({bucket, name}, source) {
        this.useBucket({name: bucket, region: this.currentBucket.region});

        let promise = this.client.copy(name, source);

        this.useBucket(this.previousBucket);

        return promise;
    }
}


export default new AliyunRepository(Client);
