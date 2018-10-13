import React from 'react';
import { RadioContext } from './context';
import classNames from 'classnames';

export default class Radio extends React.Component {

    static defaultProps = {
        onChange: function () {}
    }

    constructor (props) {
        super(props);
        this.state = {
            status: this.props.value
        };
    }

    onChange = () => {
        this.props.onChange(!this.state.status);
        this.setState({
            status: !this.state.status
        });
    }

    render () {
        const className = classNames({
            'radio-wrap': true,
            'radio-disabled': this.props.disabled
        });
        return (
            <RadioContext.Consumer>
                {({value, onChange}) => (
                    <label className={className} style={this.props.style}>
                        <div className="radio">
                            <input type="radio" className="radio-input" disabled={this.props.disabled} checked={value === this.props.value} onChange={() => onChange(this.props.value)} />
                            <span className="radio-inner"></span>
                        </div>
                        <span>{this.props.children}</span>
                    </label>
                )}
            </RadioContext.Consumer>
        );
    }
}