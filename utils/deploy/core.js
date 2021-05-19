const Ffp = require('ftp')
const fs = require('fs')
const Env = require('./env.json')

const projectDistStructure = {
    keep: [
        'cgi-bin',
        '.htaccess',
    ],
}

class FTP {
    #ftp = new Ffp()
    #list = []

    mkdir(path) {
        console.log(`FTP DIR UPLOAD: /${path}/`)
        return new Promise((resolve, reject) => {
            this.#ftp.mkdir(path, true, (err) => {
                if (err) reject(err)
                resolve(path)
            })
        })
    }

    rmdir(node) {
        return new Promise(resolve => {
            console.log(`FTP REMOVE DIR: /${node.name}/`)
            this.#ftp.rmdir(node.name, true, () => resolve(node))
        })
    }

    put(localPath, remotePath) {
        return new Promise(((resolve, reject) => {
            console.log(`FTP FILE UPLOAD: ${localPath} -> ${remotePath}`)
            this.#ftp.put(localPath, remotePath, (err) => {
                if (err) reject(err)
                resolve(localPath, remotePath)
            })
        }))
    }

    delete(node) {
        return new Promise(resolve => {
            console.log(`FTP REMOVE FILE: ${node.name}`)
            this.#ftp.delete(node.name, () => resolve(node))
        })
    }

    async taskRemoveAll() {
        return new Promise(resolve => {
            this.#list.forEach(async (node) => {
                if (!projectDistStructure.keep.includes(node.name)) {
                    switch (node.type) {
                        case 'd': {
                            await this.rmdir(node)
                            break
                        }
                        default: {
                            await this.delete(node)
                            break
                        }
                    }
                }
            })
            resolve()
        })
    }

    async taskUpload(list) {
        return new Promise((resolve, reject) => {
            if (!list || !list.length) reject('list is empty')
            list.filter(d => d.type === 'd').forEach(async (d) => {
                const {remotePath} = d
                await this.mkdir(remotePath)
            })
            list.filter(d => d.type === '-').forEach(async (d) => {
                const {localPath, remotePath} = d
                await this.put(localPath, remotePath)
            })
            resolve()
        })
    }

    autoDeploy(fileList) {
        console.log('FTP START')
        this.#ftp.connect({
            'host': Env.host,
            'user': Env.user,
            'password': Env.password
        })
        this.#ftp.on('ready', () => {
            console.log('FTP READY')
            this.#ftp.list(async (err, remoteList) => {
                if (err) throw err
                this.#list = remoteList
                await this.taskRemoveAll()
                await this.delay(1000)
                await this.taskUpload(fileList)
                await this.delay(1000)
                this.#ftp.end()
                console.log('FTP END')
            })
        })
    }

    delay(s) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve()
            }, s)
        })
    }
}

class FS {
    #list = []

    setDateMarker(dirname) {
        const filename = `${dirname}/${new Date().toISOString()}.upload`
        fs.writeFileSync(filename, new Date().toLocaleString())
    }

    scan(dirname, remoteParentPath) {
        if (!fs.existsSync(dirname)) {
            throw `${dirname} not exist`
        }
        fs.readdirSync(dirname).forEach(filename => {
            const address = `${dirname}/`
            const fileLocalPath = `${address}${filename}`
            let fileRemotePath = fileLocalPath.replace(address, '')
            if (remoteParentPath) {
                fileRemotePath = [remoteParentPath, fileRemotePath].join('/')
            }
            const meta = {
                type: null,
                name: filename,
                localPath: fileLocalPath,
                remotePath: fileRemotePath,
            }
            switch (true) {
                case fs.lstatSync(fileLocalPath).isDirectory(): {
                    meta.type = 'd'
                    this.scan(fileLocalPath, fileRemotePath)
                    break
                }
                case fs.lstatSync(fileLocalPath).isFile(): {
                    meta.type = '-'
                    break
                }
            }
            this.#list.push(meta)
        })
        return this.#list
    }
}

module.exports = {
    FTP,
    FS
}
