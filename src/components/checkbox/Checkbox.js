import React from 'react';
import classNames from 'classnames';

export default class Checkbox extends React.Component {

    static defaultProps = {
        checked: false,
        onChange: function () {}
    }

    onChange = (e) => {
        this.props.onChange(e.target.checked);
    }

    render () {
        const classes = classNames({
            'checkbox': true,
            'checkbox-small': this.props.size === 'small'
        });
        return (
            <label className="checkbox-wrap">
                <div className={classes}>
                    <input type="checkbox" className="checkbox-input" checked={this.props.checked} onChange={this.onChange} />
                    <span className="checkbox-inner"></span>
                </div>
                {
                    this.props.children ? <span className="checkbox-addon">{this.props.children}</span> : null
                }
            </label>
        );
    }
}