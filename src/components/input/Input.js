import React from 'react';
import classNames from 'classnames';

export default class Input extends React.Component {

    static defaultProps = {
        type: 'text',
        onChange () {},
        onBlur () {},
        onFocus () {}
    }

    handleFocus = () => {
        this.props.onFocus();
    }

    handleBlur = () => {
        this.props.onBlur();
    }

    handleChange = (e) => {
        this.props.onChange(e.target.value, e);
    }

    render () {
        const prefix = this.props.prefix ? (
            <div className="input-prefix">
                {this.props.prefix}
            </div>
        ) : null;
        const suffix = this.props.suffix ? (
            <div className="input-suffix">
                {this.props.suffix}
            </div>
        ) : null;
        const inputCls = classNames({
            'input': true,
            'input-border': this.props.border
        });
        const wrapCls = classNames({
            'input-wrapper': true,
            'input-wrapper-button': this.props.button,
            'input-wrapper-default': this.props.default
        });
        return (
            <div className={wrapCls} style={this.props.style}>
                {prefix}
                <input
                    type={this.props.type}
                    readOnly={this.props.readOnly}
                    className={inputCls}
                    value={this.props.value || ''}
                    placeholder={this.props.placeholder}
                    onBlur={this.handleBlur}
                    onFocus={this.handleFocus}
                    onChange={this.handleChange}
                />
                {suffix}
                {this.props.button}
            </div>
        );
    }
}