import React, { Component } from 'react'

class Dummy extends Component {
    render() {
        return (
            <div className="foo">
                <i className="bar" />
            </div>
        )
    }
}

describe('Test', () => {
    const wrapper = shallow(<Dummy name="Jamie"/>)
    it('should render div', () => {
        wrapper.type().should.equal('div')
    })
    it('should className foo', () => {
        wrapper.should.have.className('foo')
    })
    it('should render icon', () => {
        wrapper.should.have.descendants('i')
    })
    it('should render icon with class bar', () => {
        wrapper.find('i').should.have.className('bar')
    })
});
