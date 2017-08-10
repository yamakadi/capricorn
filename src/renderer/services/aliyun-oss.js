import oss from 'ali-oss';
import LocalStorage from './localStorage';

// LocalStorage.remove('credentials');
// LocalStorage.remove('defaultBucket');

export const Client = new oss.Wrapper(
    LocalStorage.get('credentials', {
        accessKeyId: 'none',
        accessKeySecret: 'none'
    })
);

export default Client;
