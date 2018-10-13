import React from 'react';
import { FormItem, FormItemGroup } from '../../components/form';
import { NavLink, withRouter } from 'react-router-dom';
import { moneyFormat } from '@/utils/accounting';
import { observer, inject } from 'mobx-react';
import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';
import Table from 'components/table/Table';
import className from 'classnames';
import api from '@/api';

@inject('store')
@observer
class Header extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            visible: false,
            concatModal: false,
            mobileModal: false,
            emailModal: false,
            pwdModal: false,
            auditModal: false,
            contact: '',
            oldPassword: '',
            password: '',
            mobile: '',
            email: '',
            confirmPwd: '',
            amountOfInvestment: '',
            averageInterestRate: '',
            maximumInterestRate: '',
            minimumInterestRate: '',
            systemApprovalAmount: '',
            totalAmountApplied: '',
            message: '',
            modalError: '',
            columns: [
                {
                    title: '供应商',
                    key: 'invoiceCompanyName',
                },
                {
                    title: '发票号',
                    key: 'invoiceNum'
                },
                {
                    title: '申请金额',
                    key: 'money',
                    render: params => {
                        if (params.money) {
                            return <span>{moneyFormat(params.money, 2)}</span>
                        } else {
                            return null;
                        }
                    }
                },
                {
                    title: '申请利率',
                    key: 'discountYearInterest',
                    render: params => params.discountYearInterest ? params.discountYearInterest + '%' : null
                },
                {
                    title: '账期',
                    key: 'accountPeriod',
                    render: params => params.accountPeriod ? params.accountPeriod + '天' : null
                },
                {
                    title: '操作',
                    render: params => {
                        return <Button min onClick={() => this.onCancel(params)}>取消</Button>
                    }
                }
            ],
            tableData: []
        };
    }

    onCancel = ({invoiceId}) => {
        api.updApperovalState(`invoiceId=${invoiceId}`).then(res => {
            console.log(res);
            if (res && res.b) {
                this.props.store.fetchAuditInfo();
            }
        });
    }

    handleMouseEnter = () => {
        this.setState({
            visible: true
        });
    }

    handleMouseLeave = () => {
        this.setState({
            visible: false
        });
    }

    handleClick = () => {
        this.setState({
            visible: !this.state.visible
        });
    }

    openEmailModal = () => {
        this.setState({
            emailModal: true
        });
    }

    openPwdModal = () => {
        this.setState({
            pwdModal: true
        });
    }

    openMobileModal = () => {
        this.setState({
            mobileModal: true
        });
    }

    openUserModal = () => {
        this.setState({
            concatModal: true
        });
    }

    showAudiInfo = () => {
        this.props.store.fetchAuditInfo();
        this.props.store.changeVisible(true);
    }

    logout = () => {
        this.props.store.logout();
        this.props.history.push('/login');
    }

    handleNext = () => {
        this.setState({
            concatModal: false,
            mobileModal: true
        });
    }

    getContact = (value) => {
        this.setState({
            contact: value
        });
    }

    getMobile = (value) => {
        this.setState({
            mobile: value
        });
    }

    getEmail = (value) => {
        this.setState({
            email: value
        });
    }

    getOldPassword = (value) => {
        this.setState({
            oldPassword: value
        });
    }

    getPassword = (value) => {
        this.setState({
            password: value
        });
    }

    getConfirmPwd = (value) => {
        this.setState({
            confirmPwd: value
        });
    }

    updateEmail = () => {
        if (!this.state.email) {
            this.showMessage('请输入新的邮箱');
            return;
        }
        let { userId } = this.props.store.user;
        api.updateUser({
            "userId": userId,
            "mailbox": this.state.email,
        }).then(res => {
            if (res.resultMessage === 'success') {
                this.props.store.updateEmail(this.state.email);
                this.setState({
                    emailModal: false
                });
            } else if (res) {
                this.showMessage(res.resultMessage);
            } else {
                this.showMessage('请求服务失败');
            }
        });
    }

    updatePassword = () => {
        if (!this.state.oldPassword) {
            this.showMessage('请输入旧密码');
            return;
        }
        if (!this.state.password) {
            this.showMessage('请输入新的密码');
            return;
        }
        if (this.state.confirmPwd !== this.state.password) {
            this.showMessage('两次输入密码不一致，请重新输入');
            return;
        }
        let { userId } = this.props.store.user;
        api.updatePassword({
            "userId": userId,
            "password": this.state.oldPassword,
            "newPassword": this.state.password,
        }).then(res => {
            if (res && res.resultMessage === 'success') {
                this.props.store.logout();
                this.setState({
                    pwdModal: false
                });
            } else if (res) {
                this.showMessage(res.resultMessage);
            } else {
                this.showMessage('请求服务器失败');
            }
        });
    }

    updateMobile = () => {
        if (!this.state.mobile) {
            this.showMessage('请输入新的手机号');
            return;
        }
        let { userId } = this.props.store.user;
        api.updateUser({
            "userId": userId,
            "telephone": this.state.mobile,
        }).then(res => {
            if (res && res.resultMessage === 'success') {
                this.props.store.updateMobile(this.state.mobile);
                this.setState({
                    mobileModal: false
                });
            } else if (res) {
                this.showMessage(res.resultMessage);
            } else {
                this.showMessage('请求服务失败');
            }
        });
    }

    updateContact = () => {
        if (!this.state.contact) {
            this.showMessage('请输入新的联系人');
            return;
        }
        let { userId } = this.props.store.user;
        api.updateUser({
            "userId": userId,
            "contacts": this.state.contact,
        }).then(res => {
            if (res && res.resultMessage === 'success') {
                this.props.store.updateContact(this.state.contact);
                this.setState({
                    concatModal: false
                });
            } else if (res) {
                this.showMessage(res.resultMessage);
            } else {
                this.showMessage('请求服务失败');
            }
        });
    }

    closeMobileModal = () => {
        this.setState({
            mobileModal: false
        });
    }

    closeConcatModal = () => {
        this.setState({
            concatModal: false
        });
    }

    closeEmailModal = () => {
        this.setState({
            emailModal: false
        });
    }
    
    closePwdModal = () => {
        this.setState({
            pwdModal: false
        });
    }

    closeAuditModal = () => {
        this.props.store.changeVisible(false);
    }

    showMessage = (message, duration) => {
        this.clearTimer();
		this.setState({
			message: message
		});
		this.startTimer(duration);
	}

	startTimer = (duration = 3) => {
		this.closeTimer = setTimeout(() => {
			this.clearTimer();
		}, duration * 1000);
	}

	clearTimer = () => {
		if (this.closeTimer) {
			clearTimeout(this.closeTimer);
			this.setState({
				message: ''
			});
			this.closeTimer = null;
		}
    }

    renderNavigator () {
        let optionClass = className({
            'user-options': true,
            'user-options-hidden': !this.state.visible
        });
        let { companyName, email, mobile, contact } = this.props.store.user;
        let { userType } = this.props.store.user;
        return (
            <div className="header-content">
                <ul className="header-nav">
                    <li className="header-nav-item">
                        <NavLink className="link" activeClassName="link-active" exact to="/">首页</NavLink>
                    </li>
                    <li className="header-nav-item">
                        <NavLink className="link" activeClassName="link-active" exact to="/details">详情</NavLink>
                    </li>
                    {
                        userType === 1 ? (
                            <li className="header-nav-item">
                                <NavLink className="link" activeClassName="link-active" exact to="/upload">设置/上传</NavLink>
                            </li>
                        ) : null
                    }
                    <li className="header-nav-item">
                        <NavLink className="link" activeClassName="link-active" exact to="/history">历史</NavLink>
                    </li>
                </ul>
                <div className="header-options" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                    <div className="user-options-wrap" onClick={this.handleClick}></div>
                    <div className={optionClass} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                        <ul className="list">
                            <li className="list-item"><span>{companyName}</span></li>
                            <li className="list-item"><span className="btn-text" onClick={this.openUserModal}>{contact}</span></li>
                            <li className="list-item"><span className="btn-text" onClick={this.openMobileModal}>{mobile}</span></li>
                            <li className="list-item"><span className="btn-text" onClick={this.openEmailModal}>{email}</span></li>
                            <li className="list-item"><span className="btn-text" onClick={this.openPwdModal}>修改密码</span></li>
                            <li className="list-item"><span className="btn-text" onClick={this.showAudiInfo}>系统审批信息</span></li>
                            <li className="list-item"><span className="btn-text" onClick={this.logout}>退出</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    componentWillReceiveProps (nextProps) {
        this.setState({visible: false});
    }

    render () {
        let { token } = this.props.store.user;
        let { mobile, contact } = this.props.store.user;
        const { pathname } = this.props.location;
        const { tableData, auditInfo, visible, loading } = this.props.store;
        if (pathname === '/login') return null;
        return  (
            <div className="header-wrap">
                <div className="header">
                    <NavLink exact to="/">
                        <h1 className="header-logo">
                            <img src={require('../../assets/logo.png')} width="140" height="40" alt="帷幄金服" />
                        </h1>
                    </NavLink>
                    {token ? this.renderNavigator() : null}
                </div>
                <Modal visible={this.state.concatModal} title="更改联系人" onClose={this.closeConcatModal}>
                    <ul className="list">
                        <li className="list-item">
                            <Input
                                readOnly
                                prefix={<i className="icon icon-account"></i>}
                                value={contact}
                            />
                        </li>
                        <li className="list-item">
                            <Input
                                placeholder="请输入新的联系人"
                                onChange={this.getContact}
                                prefix={<i className="icon icon-account"></i>}
                            />
                        </li>
                    </ul>
                    <div className="error-wrap">
                        <span className="error">{this.state.message}</span>
                    </div>
                    <button className="btn btn-block" onClick={this.updateContact}>确认</button>
                </Modal>
                <Modal visible={this.state.mobileModal} onClose={this.closeMobileModal}>
                    <div>
                        <FormItem>
                            <Input
                                readOnly
                                border
                                value={mobile}
                            />
                        </FormItem>
                        <FormItem>
                            <Input
                                border
                                button={<button className="btn">获取动态密码</button>}
                                placeholder="请输入验证码" />
                        </FormItem>
                        <FormItem>
                            <Input
                                border
                                onChange={this.getMobile}
                                placeholder="请输入新手机号"
                            />
                        </FormItem>
                    </div>
                    <div className="error-wrap">
                        <span className="error">{this.state.message}</span>
                    </div>
                    <button className="btn btn-block" onClick={this.updateMobile}>提交</button>
                </Modal>
                <Modal visible={this.state.emailModal} onClose={this.closeEmailModal} title="更改邮箱">
                    <ul className="list">
                        <li className="list-item">
                            <Input
                                onChange={this.getEmail}
                                prefix={<i className="icon icon-email"></i>}
                                placeholder="请输入新的邮箱地址"
                            />
                        </li>
                    </ul>
                    <div className="error-wrap">
                        <span className="error">{this.state.message}</span>
                    </div>
                    <button className="btn btn-block" onClick={this.updateEmail}>提交</button>
                </Modal>
                <Modal visible={this.state.pwdModal} onClose={this.closePwdModal} title="更改密码">
                    <ul className="list">
                        <li className="list-item">
                            <Input
                                type="password"
                                prefix={<i className="icon icon-pwd"></i>}
                                onChange={this.getOldPassword}
                                placeholder="请输入旧密码"
                            />
                        </li>
                        <li className="list-item">
                            <Input
                                type="password"
                                onChange={this.getPassword}
                                prefix={<i className="icon icon-pwd"></i>}
                                placeholder="请输入新密码"
                            />
                        </li>
                        <li className="list-item">
                            <Input
                                type="password"
                                onChange={this.getConfirmPwd}
                                prefix={<i className="icon icon-pwd"></i>}
                                placeholder="请确认新密码"
                            />
                        </li>
                    </ul>
                    <div className="error-wrap">
                        <span className="error">{this.state.message}</span>
                    </div>
                    <button className="btn btn-block" onClick={this.updatePassword}>提交</button>
                </Modal>
                <Modal
                    loading={loading}
                    visible={visible}
                    title="系统审批情况"
                    onClose={this.closeAuditModal}
                    style={{width: '700px'}}>
                    <div>
                        <FormItemGroup>
                            <FormItem label="申请总金额：" labelWidth="200">
                                <Input readOnly border value={moneyFormat(auditInfo.totalAmountApplied, 2)} />
                            </FormItem>
                            <FormItem label="获批平均利率" labelWidth="200">
                                <Input readOnly border value={auditInfo.averageInterestRate ? auditInfo.averageInterestRate + '%' : ''} />
                            </FormItem>
                        </FormItemGroup>
                        <FormItemGroup>
                            <FormItem label="拟投放金额：" labelWidth="200">
                                <Input readOnly border value={moneyFormat(auditInfo.amountOfInvestment, 2)} />
                            </FormItem>
                            <FormItem label="获批最低利率：" labelWidth="200">
                                <Input readOnly border value={auditInfo.minimumInterestRate ? auditInfo.minimumInterestRate + '%' : ''} />
                            </FormItem>
                        </FormItemGroup>
                        <FormItemGroup>
                            <FormItem label="系统审批金额：" labelWidth="200">
                                <Input readOnly border value={moneyFormat(auditInfo.systemApprovalAmount, 2)} />
                            </FormItem>
                            <FormItem label="获批最高利率：" labelWidth="200">
                                <Input readOnly border value={auditInfo.maximumInterestRate ? auditInfo.maximumInterestRate + '%' : ''} />
                            </FormItem>
                        </FormItemGroup>
                    </div>
                    <div>
                        <div style={{color: '#4cbcf0', fontSize: '12px', marginBottom: '5px'}}>获批申请详情</div>
                        <div style={{height: '100px', overflow: 'auto'}}>
                            <Table columns={this.state.columns} data={tableData} />
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default withRouter((props) => {
    return <Header {...props} />
});