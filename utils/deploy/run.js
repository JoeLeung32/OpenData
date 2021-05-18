const {FTP, FS} = require('./core')

try {
    const dirname = './dist/govhkdata'
    const DIST = new FS()
    const JOB = new FTP()
    DIST.setDateMarker(dirname)
    JOB.autoDeploy(DIST.scan(dirname))
} catch (e) {
    console.error(e)
}
