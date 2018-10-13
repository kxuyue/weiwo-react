import React from 'react';
import classNames from 'classnames';
import Loading from '../loading';

export default class Modal extends React.Component {

    static defaultProps = {
        visible: false,
        showTitle: false,
        title: '',
        onClose () {}
    }

    constructor (props) {
        super(props);
        this.state = {
            visible: this.props.visible
        }
    }

    componentWillReceiveProps (nextProps, nextState) {
        this.setState({
            visible: nextProps.visible
        });
    }

    closeModal = () => {
        this.props.onClose(!this.state.visible);
        this.setState({
            visible: false
        });
    }

    render () {
        let children = this.props.children;
        let maskClass = classNames({
            'modal-mask': true,
            'modal-mask-hidden': !this.state.visible
        });
        let wrapClass = classNames({
            'modal-wrap': true,
            'modal-wrap-hidden': !this.state.visible
        });
        let errorClass = classNames({
            'modal-error-wrap': true,
            'modal-error-hidden': !this.props.error
        });
        let errorMaskCls = classNames({
            'error-mask': this.props.error
        });
        return (
            <div>
                <div className={maskClass}></div>
                <div className={wrapClass}>
                    <div className="modal" style={this.props.style}>
                        <Loading loading={this.props.loading}>
                            <div className="modal-header">
                                <div className="modal-header-title">{this.props.title}</div>
                                <div className="modal-header-close">
                                    <span className="modal-header-close-btn" onClick={this.closeModal}></span>
                                </div>
                            </div>
                            <div className="modal-body">
                                <div className={errorClass}>
                                    <div className="modal-error">{this.props.error}</div>
                                    <div className={errorMaskCls}>
                                        {children}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer"></div>
                        </Loading>
                    </div>
                </div>
            </div>
        );
    }
}