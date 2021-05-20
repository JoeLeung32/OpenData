const process = require('process');
const {FS} = require('./core')

try {
    const ArgDirname = process.argv.find(arg => arg.indexOf('--dirname') === 0);
    if (ArgDirname && ArgDirname.split('=').length) {
        const dirname = ArgDirname.split('=')[1];
        console.log(dirname);
        const MD = new FS(dirname)
        let list
        list = MD.setupMetaData(MD.scan())
        MD.saveToJson(`${dirname}/_meta/documents.json`, list.documents)
        MD.saveToJson('${dirname}/_meta/categories.json', list.categories)
        MD.saveToJson('${dirname}/_meta/tags.json', list.tags)
    }
} catch (e) {
    console.error(e)
}
