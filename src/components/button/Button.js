import React from 'react';
import classNames from 'classnames';

export default class Button extends React.Component {

    static defaultProps = {
        onClick () {},
        block: false
    }

    onClick = () => {
        if (this.props.loading) return;
        this.props.onClick();
    }

    render () {
        let classes = classNames({
            'btn': true,
            'btn-block': this.props.block,
            'btn-small': this.props.small,
            'btn-min': this.props.min,
            'btn-loading': this.props.loading
        });
        return (
            <button
                style={this.props.style}
                disabled={this.props.disabled}
                className={classes}
                onClick={this.onClick}
            >
                <div className="ball-beat">
                    <div className="ball"></div>
                    <div className="ball"></div>
                    <div className="ball"></div>
                </div>
                <div className="main">
                    {this.props.children}
                </div>
            </button>
        );
    }
}