const process = require('process');
const {FTP, FS} = require('./core')

try {
    const ArgDirname = process.argv.find(arg => arg.indexOf('--dirname') === 0);
    if (ArgDirname && ArgDirname.split('=').length) {
        const dirname = ArgDirname.split('=')[1];
        const DIST = new FS()
        const JOB = new FTP()
        DIST.setDateMarker(dirname)
        JOB.autoDeploy(DIST.scan(dirname))
    }
} catch (e) {
    console.error(e)
}
