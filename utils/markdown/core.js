const fs = require('fs')

class FS {
    #structure = {
        mdDocument: {
            langCode: [],
            title: '',
            category: [],
            tag: [],
            remotePath: '',
            date: '',
        },
        category: {
            title: '',
            url: '',
            link: [],
        },
        tag: {
            title: '',
            url: '',
            link: [],
        }
    }

    #md = {
        documents: [],
        categories: [],
        tags: [],
    }

    #path

    constructor(path) {
        this.#path = path
    }

    scan(dirname, remoteParentPath) {
        if (!dirname) {
            dirname = this.#path
        }
        if (!fs.existsSync(dirname)) {
            throw `${dirname} not exist`
        }
        fs.readdirSync(dirname).forEach(filename => {
            if (['.DS_Store', '_meta'].includes(filename)) return
            const address = `${dirname}/`
            const fileLocalPath = `${address}${filename}`
            let fileRemotePath = fileLocalPath.replace(address, '')
            if (remoteParentPath) {
                fileRemotePath = [remoteParentPath, fileRemotePath].join('/')
            }
            const meta = {...this.#structure.mdDocument}
            meta.remotePath = fileRemotePath.replace(/(.en|.tc|.sc).md|.md/i, '')
            if (fileRemotePath.match(/(.en|.tc|.sc).md/i)) {
                meta.langCode = [fileRemotePath.match(/(.en|.tc|.sc).md/i)[1].substr(1, 2)]
            } else {
                meta.langCode = null
            }
            switch (true) {
                case fs.lstatSync(fileLocalPath).isDirectory(): {
                    this.scan(fileLocalPath, fileRemotePath)
                    break
                }
                case fs.lstatSync(fileLocalPath).isFile(): {
                    const existIndex = this.#md.documents.findIndex(md => md.remotePath === meta.remotePath)
                    if (existIndex < 0) {
                        this.#md.documents.push(meta)
                    } else {
                        this.#md.documents[existIndex].langCode = [
                            ...this.#md.documents[existIndex].langCode,
                            ...meta.langCode,
                        ]
                    }
                    break
                }
            }
        })
        return this.#md
    }

    setupMetaData(list) {
        const readFile = ({language, path}, doc, idx) => {
            let metaStart = false
            fs.readFileSync(path, 'utf8')
                .split(/\r|\n|\r\n/)
                .forEach((line) => {
                    if (line === '---') {
                        if (metaStart) {
                            metaStart = false
                            return
                        }
                        metaStart = true
                        return
                    }
                    if (metaStart) {
                        const setData = (sourceArray, value) => {
                            if (typeof sourceArray === 'string' || Array.isArray(sourceArray)) {
                                sourceArray = {}
                            }
                            sourceArray[language] = value
                            return sourceArray
                        }
                        const [key, value] = line.split(':')
                        if (['title'].includes(key)) {
                            this.#md.documents[idx][key] = setData(this.#md.documents[idx][key], value.trim())
                            this.#md.documents[idx][key]['*'] = value.trim()
                            return
                        }
                        if (['date'].includes(key)) {
                            this.#md.documents[idx][key] = value.trim()
                            return
                        }
                        if (['category', 'tag'].includes(key)) {
                            this.#md.documents[idx][key] = setData(this.#md.documents[idx][key], value.split(',').map(s => s.trim()))
                        }
                    }
                })
        }
        let categories = {}
        let tags = {}
        list.documents.forEach((doc, idx) => {
            const array = []
            let {langCode, remotePath} = doc
            if (langCode && langCode.length) {
                langCode.forEach(lang => {
                    array.push({
                        language: lang,
                        path: `${this.#path}/${remotePath}.${lang}.md`
                    })
                })
            } else {
                array.push({
                    language: '*',
                    path: `${this.#path}/${remotePath}.md`
                })
            }
            array.forEach(a => readFile(a, doc, idx))

            for (const [language, data] of Object.entries(doc.category)) {
                if (!categories[language]) {
                    categories[language] = []
                }
                data.forEach(string => {
                    categories[language].push({
                        title: string,
                        url: encodeURIComponent(string),
                        link: [],
                    })
                })
                categories[language] = categories[language]
                    .filter((refData, index, self) => index === self.findIndex((d) => d.title === refData.title))
                categories[language].forEach((d) => {
                    if (doc.category[language].includes(d.title)) {
                        d.link.push(doc.remotePath)
                    }
                })
            }

            for (const [language, data] of Object.entries(doc.tag)) {
                if (!tags[language]) {
                    tags[language] = []
                }
                data.forEach(string => {
                    tags[language].push({
                        title: string,
                        url: encodeURIComponent(string),
                        link: [],
                    })
                })
                tags[language] = tags[language]
                    .filter((refData, index, self) => index === self.findIndex((d) => d.title === refData.title))
                tags[language].forEach((d) => {
                    if (doc.tag[language].includes(d.title)) {
                        d.link.push(doc.remotePath)
                    }
                })
            }
        })

        categories.final = [...categories['*']]
        Object.keys(categories).filter(k => !['*', 'final'].includes(k)).forEach(key => {
            categories[key].forEach(data => {
                const index = categories.final.findIndex(f => f.title === data.title)
                if (index >= 0) {
                    if (!categories.final[index].link.includes(data.link)) {
                        categories.final[index].link = [
                            ...categories.final[index].link,
                            ...data.link
                        ]
                    }
                } else {
                    categories.final.push(data)
                }
            })
        })

        tags.final = [...tags['*']]
        Object.keys(tags).filter(k => !['*', 'final'].includes(k)).forEach(key => {
            tags[key].forEach(data => {
                const index = tags.final.findIndex(f => f.title === data.title)
                if (index >= 0) {
                    if (!tags.final[index].link.includes(data.link)) {
                        tags.final[index].link = [
                            ...tags.final[index].link,
                            ...data.link
                        ]
                    }
                } else {
                    tags.final.push(data)
                }
            })
        })

        categories.final.sort((a, b) => a.title > b.title ? 1 : -1).map((data) => {
            return data.link.map((link, linkIndex) => {
                data.link[linkIndex] = this.#md.documents.find(doc => doc.remotePath === link)
            })
        })

        tags.final.sort((a, b) => a.title > b.title ? 1 : -1).forEach((data) => {
            return data.link.map((link, linkIndex) => {
                data.link[linkIndex] = this.#md.documents.find(doc => doc.remotePath === link)
            })
        })

        this.#md.categories = categories.final
        this.#md.tags = tags.final

        this.#md.documents.sort((a, b) => new Date(a.date) > new Date(b.date) ? -1 : 1);
        return this.#md
    }

    saveToJson(path, data) {
        fs.writeFileSync(path, JSON.stringify(data, null, 2))
    }

}

module.exports = {
    FS,
}
