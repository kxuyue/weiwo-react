import React from 'react';
import classNames from 'classnames';

export default function FormItem (props) {
    let classes = classNames({
        'form-item': true,
        'form-item-inline': props.inline
    });
    return (
        <div className={classes} style={props.style}>
            {props.label ? <label className="form-item-label" style={{width: props.labelWidth + 'px'}}>{props.label}</label> : null}
            <div className="form-item-content">
                {props.children}
            </div>
        </div>
    );
}