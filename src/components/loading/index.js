import React from 'react';
import classNames from 'classnames';

export default class Loading extends React.Component {

    static defaultProps = {
        loading: false,
        tip: ''
    }

    render () {
        const classes = classNames({
            'loading-container': true,
            'loading-mask': this.props.loading
        });
        return (
            <div className="loading-wrap">
                {
                    this.props.loading ? (
                        <div className="loading">
                            <div className="ball"></div>
                        </div>) : null
                }
                <div className={classes}>{this.props.children}</div>
            </div>
        );
    }
}