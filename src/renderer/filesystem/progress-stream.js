import through from 'through2';
import speedometer from 'speedometer';

export class ProgressStream {
    /**
     * Construct a new progress stream
     * @param {Object} options
     * @param {Function} onProgress
     */
    constructor(options, onProgress = null) {
        this.options = options;

        this.length = this.options.length || 0;
        this.time = this.options.time || 0;
        this.drain = this.options.drain || false;
        this.transferred = this.options.transferred || 0;
        this.nextUpdate = Date.now() + this.time;
        this.delta = 0;
        this.speed = speedometer(this.options.speed || 5000);
        this.startTime = Date.now();

        this.update = {
            percentage: 0,
            transferred: this.transferred,
            length: this.length,
            remaining: this.length,
            eta: 0,
            runtime: 0,
            speed: 0
        };

        this.through = through(
            this.options.objectMode
                ? {objectMode: true, highWaterMark: 16}
                : {},
            this.write(),
            this.end()
        );

        this.through.setLength = this.onLength;
        this.through.progress = this.progress;

        this.through.on('pipe', this.pipe());
        if (this.drain) this.through.resume();
        if (onProgress) this.through.on('progress', onProgress);
    }

    emit(ended) {
        this.update.delta = this.delta;

        this.update.percentage = ended
            ? 100
            : (this.length ? this.transferred / this.length * 100 : 0);

        this.update.speed = this.speed(this.delta);
        this.update.eta = Math.round(this.update.remaining / this.update.speed);
        this.update.runtime = parseInt((Date.now() - this.startTime) / 1000);
        this.nextUpdate = Date.now() + this.time;

        this.delta = 0;

        this.through.emit('progress', this.update);
    }

    /**
     * @param {Number} newLength
     */
    onLength(newLength) {
        this.length = newLength;
        this.update.length = this.length;
        this.update.remaining = this.length - this.update.transferred;
        this.through.emit('length', this.length);
    }

    pipe() {
        return (stream) => {
            if (typeof this.length === 'number') return;

            if (stream.readable && !stream.writable && stream.headers) {
                return this.onLength(
                    parseInt(stream.headers['content-length'] || 0)
                );
            }

            if (typeof stream.length === 'number') {
                return this.onLength(stream.length);
            }

            stream.on('response', (response) => {
                if (!response || !response.headers) return;
                if (response.headers['content-encoding'] === 'gzip') return;
                if (response.headers['content-length']) {
                    return this.onLength(
                        parseInt(response.headers['content-length'])
                    );
                }
            });
        };
    }

    get progress() {
        this.update.speed = this.speed(0);
        this.update.eta = Math.round(this.update.remaining / this.update.speed);

        return this.update;
    }

    write() {
        return (chunk, _encoding, callback) => {
            let length = this.options.objectMode ? 1 : chunk.length;

            this.transferred += length;
            this.delta += length;
            this.update.transferred = this.transferred;
            this.update.remaining = this.length >= this.transferred
                ? this.length - this.transferred
                : 0;

            if (Date.now() >= this.nextUpdate) this.emit(false);

            callback(null, chunk);
        };
    };

    end() {
        return (callback) => {
            this.emit(true);

            callback();
        };
    }

}

export default ProgressStream;

