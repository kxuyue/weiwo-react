import React from 'react';
import { RadioContext } from './context';

export default class Group extends React.Component {

    static defaultProps = {
        onChange () {}
    }

    constructor (props) {
        super(props);
        this.state = {
            value: ''
        };
    }

    onChange = (value) => {
        this.props.onChange(value);
        this.setState({value: value});
    }

    render () {
        return (
            <div style={this.props.style}>
                <RadioContext.Provider value={{value: this.props.value, onChange: this.onChange}}>
                    {this.props.children}
                </RadioContext.Provider>
            </div>
        );
    }
}