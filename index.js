const got = require('got')

// Stable sort by Filip Sufitchi (@fsufitch)
// https://medium.com/@fsufitch/is-javascript-array-sort-stable-46b90822543f
const stableSort = function(array, cmp) {
    cmp = !!cmp ? cmp : (a, b) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
    }
    const stabilized = array.map((el, index) => [el, index])
    const stableCmp = (a, b) => {
        const order = cmp(a[0], b[0])
        return order != 0 ? order : a[1] - b[1]
    }
    stabilized.sort(stableCmp)
    for (let i = 0; i < array.length; ++i) {
        array[i] = stabilized[i][0]
    }
    return array
}

// Function to retrieve data from the API
async function getFromAPI(url) {
    try {
        const response = await got(url, { json: true })
        return Promise.resolve(response.body)
    } catch (error) {
        return Promise.reject(error)
    }
}


module.exports = {
    getManga: async function(id) {
        // Verify input
        if (!Number.isInteger(id)) {
            return Promise.reject(new Error('id is not a valid integer'))
        }

        // Retrieve data from API
        try {
            var result = await getFromAPI(`https://mangadex.org/api/manga/${id}`)
        } catch (error) {
            return Promise.reject(error)
        }
        
        // Post-processing
        result.chapters = Object.entries(result.chapter || {}).map(([id, ch]) => { ch.id = parseInt(id); return ch })
        result.chapter = undefined

        return Promise.resolve(result)
    },
    getChapter: async function(id) {
        // Verify input
        if (!Number.isInteger(id)) {
            return Promise.reject(new Error('id is not a valid integer'))
        }

        return getFromAPI(`https://mangadex.org/api/chapter/${id}`)
    },


    // Internal functions taken from the official reader
    internals: {
        sortChapters: function(chapters) {
            const sorter = require('natsort').default({ asc: true, insensitive: true })

            // sort by volume desc, so that vol null > vol number where ch are equal
            stableSort(chapters, (a, b) => sorter(b.volume, a.volume))
            // sort by first group
            stableSort(chapters, (a, b) => sorter(a.group_id, b.group_id))
            // sort by chapter number
            stableSort(chapters, (a, b) => sorter(a.chapter, b.chapter))
            // add ghost prev vol numbers
            let pv = '0'
            chapters.forEach(c => {
              c.__prev_vol = pv
              if (c.volume) {
                pv = c.volume
              }
            })
            // sort by vol or prev vol
            stableSort(chapters, (a, b) => sorter(a.volume || a.__prev_vol, b.volume || b.__prev_vol))
            // remove ghost vols
            chapters.forEach(c => { delete c.__prev_vol })

            return chapters
        },

        areChaptersSequential: function(c1, c2) {
            const c1Chapter = parseFloat(c1.chapter)
            const c2Chapter = parseFloat(c2.chapter)
            const c1Volume = parseFloat(c1.volume)
            const c2Volume = parseFloat(c2.volume)

            if (isNaN(c1Chapter) || isNaN(c2Chapter)) {
                return undefined
            } else if (c1Chapter === c2Chapter && c1Volume === c2Volume) {
                return false
            } else if (Math.abs(c1Chapter - c2Chapter).toFixed(1) <= 1.1) {
                return true
            } else if ((c1Chapter <= 1.1 && Math.floor(c1Volume - c2Volume) === 1) || (c2Chapter <= 1.1 && Math.floor(c2Volume - c1Volume) === 1)) {
                return true
            }

            return false
        }
    }
}