import React from 'react';

export default class InputGroup extends React.Component {

    render () {
        return (
            <div className="input-group">{this.props.children}</div>
        );
    }
}