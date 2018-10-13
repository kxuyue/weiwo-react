import React from 'react';
import classNames from 'classnames';

export default class MenuItem extends React.Component {

    static defaultProps = {
        onSelect () {}
    }

    handleClick = () => {
        if (this.props.disabled) return;
        if (this.props.index === this.props.activeKey) return;
        this.props.onSelect(this.props.index);
    }

    render () {
        const classes = classNames({
            'select-menu': true,
            'select-menu-active': this.props.index === this.props.activeKey
        });
        return (
            <div className={classes} onClick={this.handleClick}>{this.props.children}</div>
        );
    }
}