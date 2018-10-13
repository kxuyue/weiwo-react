import React from 'react';

export default class Notice extends React.Component {

    componentDidMount () {
        this.startCloseTimer();
    }

    componentWillUnmount () {
        this.clearCloseTimer();
    }

    startCloseTimer = () => {
        if (this.props.duration) {
            this.closeTimer = setTimeout(() => {
                this.clearCloseTimer();
            }, this.props.duration * 1000);
        }
    }

    clearCloseTimer = () => {
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
            this.closeTimer = null;
        }
    }

    render () {
        return (
            <div className="message">
                <div className="message-notice">
                    <span className="message-notice-content">dddd</span>
                </div>
            </div>
        );
    }
}