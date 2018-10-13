import React from 'react';

export default class Menu extends React.Component {

    static defaultProps = {
        onSelect () {},
        onReset () {}
    }

    state = {
        activeKey: this.props.activeKey
    }


    onSelect = (key) => {
        this.setState({
            activeKey: key
        });
        this.props.onSelect(key);
    }

    renderMenuItem = () => {
        return React.Children.map(this.props.children, (item, i) => {
            return React.cloneElement(item, {
                activeKey: this.state.activeKey,
                index: item.key,
                disabled: item.props.disabled,
                onSelect: this.onSelect
            })
        })
    }

    render () {
        return (
            <div className="details-aside-item" >
                {this.props.title ? <div className="title">{this.props.title}</div> : null}
                {this.renderMenuItem()}
            </div>
        );
    }
}