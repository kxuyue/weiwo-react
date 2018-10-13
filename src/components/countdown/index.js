import React from 'react';

export default class Countdown extends React.Component {

    static defaultProps = {
        onTimesUp () {}
    }

    state = {
        currentTime: this.getDateTime()
    }

    constructor (props) {
        super(props);
        this.offset = this.getTomorrow();
    }

    getTomorrow () {
        let date = new Date();
        if (date.getHours() >= 12 && date.getMinutes() >= 0 && date.getSeconds() >= 0) {
            date.setDate(date.getDate() + 1);
        }
        date.setHours(12);
        date.setMinutes(0);
        date.setSeconds(0);
        let offset = date.getTime() - Date.now();
        return offset > 0 ? offset : 0;
    }

    getDateTime () {
        if (typeof this.offset === 'undefined') {
            this.offset = this.getTomorrow();
        }
        if (this.offset <= 0) {
            this.offset = this.getTomorrow();
            this.props.onTimesUp();
        }
        let sec = (this.offset -= 1000) / 1000;
        let hours = parseInt(sec / 3600, 10);
        let minute = parseInt(sec / 60 % 60, 10);
        let mi = parseInt(sec % 60, 10);
        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minute < 10) {
            minute = '0' + minute;
        }
        if (mi < 10) {
            mi = '0' + mi;
        }
        return hours + ':' + minute + ':' + mi;
    }

    componentDidMount () {
        this.countdown();
        this.timer = setInterval(this.countdown, 1000);
    }

    countdown = () => {
        let currentTime = this.getDateTime();
        this.setState({
            currentTime: currentTime
        });
    }

    componentWillUnmount () {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    render () {
        return (
            <span className="color-strong">{this.state.currentTime}</span>
        );
    }
}