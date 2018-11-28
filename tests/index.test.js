const mangadex = require(`${__dirname}/../index`)
const chapterList = require(`${__dirname}/files/chapterList.json`)


describe('Endpoints', () => {
    test('getManga()', async () => {
        expect.assertions(1)
        expect(await mangadex.getManga(6510)).toMatchSnapshot()
    })
    test('getChapter()', async () => {
        expect(await mangadex.getChapter(45522)).toMatchSnapshot({
            server: expect.any(String),
        })
    })
})

describe('Internals', () => {
    describe('areChaptersSequential', () => {
        /*
            map:
        */
       function newChapterObject(str) {
           const regex = new RegExp(/v(.+)c(.+)/)
           const results = regex.exec(str)

           return {
               volume: results[1] !== '?' ? results[1] : '',
               chapter: results[2] !== '?' ? results[2] : ''
           }
       }

        describe('Ascending', () => {
            test('v1c1 & v1c2', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c1'),
                        newChapterObject('v1c2')
                    )
                )
                    .toBe(true)
            })
            test('v1c1 & v?c2', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c1'),
                        newChapterObject('v?c2')
                    )
                )
                    .toBe(true)
            })
            test('v1c1 & v2c6', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c1'),
                        newChapterObject('v2c6')
                    )
                )
                    .toBe(false)
            })
            test('v1c1 & v1c?', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c1'),
                        newChapterObject('v1c?')
                    )
                )
                    .toBe(undefined)
            })
            test('v1c1.1 & v1c1.2', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c1.1'),
                        newChapterObject('v1c1.2')
                    )
                )
                    .toBe(true)
            })
            test('v1c1.2 & v2c1.1', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c1.2'),
                        newChapterObject('v2c1.1')
                    )
                )
                    .toBe(true)
            })
            test('v1c1.2 & v2c6', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c1.2'),
                        newChapterObject('v2c6')
                    )
                )
                    .toBe(false)
            })
            test('v1c5 & v2c1', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c5'),
                        newChapterObject('v2c1')
                    )
                )
                    .toBe(true)
            })
            test('v1c1 & v2c3', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c1'),
                        newChapterObject('v2c3')
                    )
                )
                    .toBe(false)
            })
            test('v1c5 & v3c1', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c5'),
                        newChapterObject('v3c1')
                    )
                )
                    .toBe(false)
            })
            test('v1c5 & v2c1.1', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c5'),
                        newChapterObject('v2c1.1')
                    )
                )
                    .toBe(true)
            })
            test('v1c5 & v2c1.2', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c5'),
                        newChapterObject('v2c1.2')
                    )
                )
                    .toBe(false)
            })
        })

        describe('Descending', () => {
            test('v1c2 & v1c1', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c2'),
                        newChapterObject('v1c1')
                    )
                )
                    .toBe(true)
            })
            test('v?c2 & v1c1', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v?c2'),
                        newChapterObject('v1c1')
                    )
                )
                    .toBe(true)
            })
            test('v2c6 & v1c1', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v2c6'),
                        newChapterObject('v1c1')
                    )
                )
                    .toBe(false)
            })
            test('v1c? & v1c1', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c?'),
                        newChapterObject('v1c1')
                    )
                )
                    .toBe(undefined)
            })
            test('v1c1.2 & v1c1.1', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v1c1.2'),
                        newChapterObject('v1c1.1')
                    )
                )
                    .toBe(true)
            })
            test('v2c1.1 & v1c1.2', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v2c1.1'),
                        newChapterObject('v1c1.2')
                    )
                )
                    .toBe(true)
            })
            test('v2c6 & v1c1.2', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v2c6'),
                        newChapterObject('v1c1.2')
                    )
                )
                    .toBe(false)
            })

            test('v2c1 & v1c5', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v2c1'),
                        newChapterObject('v1c5')
                    )
                )
                    .toBe(true)
            })
            test('v2c3 & v1c1', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v2c3'),
                        newChapterObject('v1c1')
                    )
                )
                    .toBe(false)
            })
            test('v3c1 & v1c5', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v3c1'),
                        newChapterObject('v1c5')
                    )
                )
                    .toBe(false)
            })
            test('v2c1.1 & v1c5', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v2c1.1'),
                        newChapterObject('v1c5')
                    )
                )
                    .toBe(true)
            })
            test('v2c1.2 & v1c5', () => {
                expect(
                    mangadex.internals.areChaptersSequential(
                        newChapterObject('v2c1.2'),
                        newChapterObject('v1c5')
                    )
                )
                    .toBe(false)
            })
        })
    })
    describe('sortChapters', () => {
        test('Just Works (tm)', () => {
            expect(mangadex.internals.sortChapters(chapterList))
                .toMatchSnapshot()
        })
    })
})