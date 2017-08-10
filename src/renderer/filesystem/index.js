import * as fs from 'fs';
import {remote} from 'electron';
import {ProgressStream} from './progress-stream';

export class Filesystem {
    /**
     * @param {Object} remote
     * @param {Object} fs
     */
    constructor(remote, fs) {
        this.remote = remote;
        this.fs = fs;
    }

    /**
     * Show a dialog box to select a location for downloaded file
     * @param {String} defaultName
     * @param {Object} options
     * @returns {string}
     */
    getSavePathThroughDialog(defaultName, options = {}) {
        let defaultOptions = {
            defaultPath: defaultName
        };

        return this.remote.dialog.showSaveDialog(
            Object.assign({}, defaultOptions, options)
        );
    }

    /**
     * Save a file stream to a given path
     * @param {String} path
     * @param {Readable|IncomingMessage} stream
     * @param {Function} onProgress
     */
    saveFileStreamToPath(path, stream, onProgress) {
        let progress = new ProgressStream({
            length: stream.hasOwnProperty('headers')
                ? stream.headers['content-length']
                : 0,
            time: 500
        }, onProgress);

        stream.pipe(progress.through).pipe(this.fs.createWriteStream(path));
    }

    /**
     * Show a dialog box to select a file for upload
     * @param {Object} options
     * @returns {string|null}
     */
    openFileThroughDialog(options = {}) {
        let files = this.remote.dialog.showOpenDialog(options);

        if (!files) {
            return null;
        }

        return files[0];
    }

    /**
     * Show a dialog box to select a file for upload
     * @param {Object} options
     * @returns {string[]}
     */
    openFilesThroughDialog(options = {}) {
        return this.remote.dialog.showOpenDialog(options);
    }
}

export default new Filesystem(remote, fs);