import React from 'react';
import classNames from 'classnames';

export default function FormItem (props) {
    let classes = classNames({
        'form-item-group': true,
        'form-item-group-inline': props.inline
    });
    return (
        <div className={classes} style={props.style}>
            {props.children}
        </div>
    );
}