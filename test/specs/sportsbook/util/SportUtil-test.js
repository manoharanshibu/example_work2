import {
    slugify,
    eventInplay,
    marketInplay,
    selectionInplay
} from 'sportsbook/util/SportUtil'

class Model {
    constructor(key, val) {
        this[key] = val
    }
    get(key) {
        return this[key]
    }
}

describe('SportUtil', () => {
    describe('slugify', () => {
        let str
        it('should replace " / " with "-"', () => {
            str = slugify('some / string / with / slashes')
            str.should.equal('some-string-with-slashes')
        })
        it('should replace "/" with "-"', () => {
            str = slugify('some / string/with/whitespace    /and /   slashes')
            str.should.equal('some-string-with-whitespace-and-slashes')
        })
        it('should replace "," with "-"', () => {
            str = slugify('some,string,with,commas')
            str.should.equal('some-string-with-commas')
        })
        it('should replace " " with "-"', () => {
            str = slugify('some      string with          whitespace')
            str.should.equal('some-string-with-whitespace')
        })
        it('should replace "---" with "-"', () => {
            str = slugify('some----string--with-------dashes')
            str.should.equal('some-string-with-dashes')
        })
    });

    describe('eventInplay', () => {
        it('event should be inplay', () => {
            const event = new Model('inplay', true)
            eventInplay(event).should.equal(true)
        })
        it('event should not be inplay', () => {
            const event = new Model('inplay', false)
            eventInplay(event).should.equal(false)
        })
    });

    describe('marketInplay', () => {
        it('event should be inplay', () => {
            const event = new Model('inplay', true)
            const market = new Model('parent', event)
            marketInplay(market).should.equal(true)
        })
        it('event should not be inplay', () => {
            const event = new Model('inplay', false)
            const market = new Model('parent', event)
            marketInplay(market).should.equal(false)
        })
    });

    describe('selectionInplay', () => {
        it('event should be inplay', () => {
            const event = new Model('inplay', true)
            const market = new Model('parent', event)
            const selection = new Model('parent', market)
            selectionInplay(selection).should.equal(true)
        })
        it('event should not be inplay', () => {
            const event = new Model('inplay', false)
            const market = new Model('parent', event)
            const selection = new Model('parent', market)
            selectionInplay(selection).should.equal(false)
        })
    });
});


