import React from 'react';
import Checkbox from 'components/checkbox/Checkbox';
import Button from 'components/button/Button';
import { observer, inject } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import Input from 'components/input/Input';
import Modal from 'components/modal';
import classNames from 'classnames';
import api from '@/api';

@inject('store')
@observer
export default class Login extends React.Component {

	maxMinute = 60;

	minute = this.maxMinute;

	expires = 7; // 免密码登录7天

	timer = null;

	constructor (props) {
		super(props);
		this.state = {
			showOptions: false,
			account: '',
			password: '',
			newPwd: '',
			confirmPwd: '',
			userType: '',
			remenber: false,
			minute: this.maxMinute,
			modifyModal: false,
			disabled: false,
			message: '',
			modifyMessage: '',
			mobile: '',
			verifyCode: '',
			loading: false,
			loging: false,
			modalError: '',
			redirectToReferrer: false
		}
	}

	goRegister = () => {
		this.props.history.push('/register');
	}

	handleSelect = (e) => {
		if (this.state.showOptions) {
			this.setState({
				showOptions: false
			});
		} else {
			this.setState({
				showOptions: true
			});
		}
	}

	onSelect = (type) => {
		this.setState({
			userType: type
		});
	}

	handleAccount = (value) => {
		this.setState({account: value});
	}

	handlePwd = (value) => {
		this.setState({password: value});
	}

	doSubmit = (e) => {
		if (e.keyCode === 13) {
			this.submit();
		}
	}

	submit = () => {
		if (!this.state.userType) {
			this.showMessage('请选择登录类型');
			return;
		}
		if (!this.state.account) {
			this.showMessage('请输入账号');
			return;
		}
		if (!this.state.password) {
			this.showMessage('请输入密码');
			return;
		}
		this.setState({loging: true});
		api.login({
			companyName: this.state.account,
			password: this.state.password,
			type: this.state.userType
		}).then(res => {
			this.setState({loging: false});
			if (res) {
				if (res.resultMessage === 'success') {
					let day = this.state.remenber ? this.expires : null;
					this.props.store.login({
						contact: res.resultData.o.contacts,
						email: res.resultData.o.mailbox,
						mobile: res.resultData.o.telephone,
						userId: res.resultData.o.userId,
						companyName: this.state.account,
						userType: this.state.userType,
						token: res.resultData.msg
					}, day);
					this.props.history.push('/');
				} else {
					this.showMessage(res.resultMessage);
				}
			}
		});
	}

	showMessage = (message, duration) => {
		this.clearTimer();
		this.setState({
			message: message
		});
		this.startTimer(duration);
	}

	showModifyMessage = (modifyMessage, duration) => {
		this.clearTimer();
		this.setState({
			modifyMessage: modifyMessage
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
				message: '',
				modifyMessage: ''
			});
			this.closeTimer = null;
		}
	}

	modifyPwd = () => {
		if (!this.state.mobile) {
			this.showModifyMessage('请输入手机号');
			return;
		}
		if (!this.state.verifyCode) {
			this.showModifyMessage('请输入验证码');
			return;
		}
		if (!this.state.newPwd) {
			this.showModifyMessage('请输入新密码');
			return;
		}
		if (this.state.newPwd !== this.state.confirmPwd) {
			this.showModifyMessage('两次密码输入不一致，请重新输入');
			return;
		}
		this.setState({loading: true});
		api.retrievePwd({
			"tellphone": this.state.mobile,
			"code": this.state.verifyCode,
            "newPassword": this.state.newPwd
		}).then(res => {
			if (res && res.resultMessage === 'success') {
				this.setState({loading: false, modifyModal: false});
			} else {
				this.setState({loading: false, modalError: '请求服务器失败'});
			}
		});
		
	}

	openModal = () => {
		this.setState({
			modifyModal: true
		});
	}

	onClose = () => {
		this.setState({
			newPwd: '',
			confirmPwd: '',
			verifyCode: '',
			mobile: '',
			disabled: false,
			minute: this.maxMinute,
			modifyModal: false,
			modalError: ''
		});
		this.clearTimer();
	}

	sendCode = () => {
		if (!this.state.mobile) {
			this.showModifyMessage('请输入手机号');
			return;
		}
		this.setState({
			disabled: true
		});
		const MODIFY_PASSWORD_TYPE = 2;
        api.sendSMS(`cellphone=${this.state.mobile}&type=${MODIFY_PASSWORD_TYPE}`).then(res => {
            if (res) {
                console.log('验证码发送成功');
            }
        });
		this.timer = setInterval(() => {
			this.minute--;
			if (this.minute <= 0) {
				this.minute = this.maxMinute;
				this.setState({
					disabled: false,
					minute: this.minute
				});
				clearInterval(this.timer);
			} else {
				this.setState({
					minute: this.minute
				});
			}
		}, 1000);
	}

	getNewPwd = (newPwd) => {
		this.setState({
			newPwd: newPwd
		});
	}

	getMobile = (value) => {
		this.setState({
			mobile: value
		});
	}

	getVerifyCode = (value) => {
		this.setState({
			verifyCode: value
		});
	}

	getConfirmPwd = (confirmPwd) => {
		this.setState({
			confirmPwd: confirmPwd
		});
	}

	remenberLogin = (checked) => {
		this.setState({
			remenber: checked
		});
	}

	componentDidMount () {
		const { token } = this.props.store.user;
		this.setState({...this.props.store.registerInfo});
		if (token) {
			this.setState({
				redirectToReferrer: true
			});
		}
	}

	componentWillUnmount () {
        clearInterval(this.timer);
    }

	render () {
		let dropDownClass = classNames({
			"select-dropdown": true,
			"select-dropdown-open": this.state.showOptions
		});
		const { from } = this.props.location.state || { from: {pathname: '/'}};
		const { redirectToReferrer } = this.state;
		if (redirectToReferrer) {
			return <Redirect to={from} />
		}
		return (
			<div className="login-page" onKeyUp={this.doSubmit}>
				<div className="login">
					<div className="error-wrap">
						<span className="error">{this.state.message}</span>
					</div>
					<div className="login-title">帷幄供应链金融管理系统</div>
					<div className="login-form">
						<div className="login-form-item">
							<div className="select" onClick={this.handleSelect}>
								<div className="select-header">
									<div className="select-prefix">
										<i className="icon icon-account"></i>
									</div>
									<div className="select-header-text">
										{this.state.userType ? this.state.userType === 1 ? '采购商' : '供应商' : '请选择'}
									</div>
									<div className="select-suffix">
										<i className="icon icon-sanjiao"></i>
									</div>
								</div>
								<div className={dropDownClass}>
									<ul className="select-dropdown-list">
										<li onClick={() => this.onSelect(1)}>采购商</li>
										<li onClick={() => this.onSelect(2)}>供应商</li>
									</ul>
								</div>
							</div>
						</div>
						<div className="login-form-item">
							<Input
								default
								prefix={<i className="icon icon-house"></i>}
								placeholder="请输入账号"
								value={this.state.account}
								onChange={this.handleAccount}
							/>
						</div>
						<div className="login-form-item">
							<Input
								default
								type={'password'}
								prefix={<i className="icon icon-pwd"></i>}
								suffix={<i className="icon icon-eye"></i>}
								placeholder="请输入密码"
								value={this.state.password}
								onChange={this.handlePwd}
							/>
						</div>
						<div className="box">
							<Checkbox checked={this.state.remenber} size="small" onChange={this.remenberLogin}>下次自动登录</Checkbox>
							<span onClick={this.openModal}>忘记密码</span>
						</div>
						<div className="login-form-item">
							<Button loading={this.state.loging} onClick={this.submit} block>登录</Button>
						</div>
						<div className="register-text">没有账号？<span onClick={this.goRegister}>免费注册</span></div>
					</div>
				</div>
				<Modal
					error={this.state.modalError}
					loading={this.state.loading}
					visible={this.state.modifyModal}
					title="找回密码"
					onClose={this.onClose}>
					<div>
						<ul className="list">
							<li className="list-item">
								<Input
									value={this.state.mobile}
									prefix={<i className="icon icon-phone"></i>}
									placeholder="请输入已有账号绑定的手机号"
									onChange={this.getMobile}
								/>
								<button className="btn-small" disabled={this.state.disabled} onClick={this.sendCode}>
									{this.state.disabled ? this.state.minute + '秒' : '获取验证码'}
								</button>
							</li>
							<li className="list-item">
								<Input
									value={this.state.verifyCode}
									prefix={<i className="icon icon-pwd"></i>}
									placeholder="请输入验证码"
									onChange={this.getVerifyCode}
								/>
							</li>
							<li className="list-item">
								<Input
									value={this.state.newPwd}
									type={'password'}
									prefix={<i className="icon icon-pwd"></i>}
									placeholder="请输入新密码"
									onChange={this.getNewPwd}
								/>
							</li>
							<li className="list-item">
								<Input
									value={this.state.confirmPwd}
									type={'password'}
									prefix={<i className="icon icon-pwd"></i>}
									placeholder="请再次输入新密码"
									onChange={this.getConfirmPwd}
								/>
							</li>
						</ul>
						<div className="error-wrap">
							<div className="error">{this.state.modifyMessage}</div>
						</div>
						<div className="modal-footer">
							<Button onClick={this.modifyPwd} block>确定</Button>
						</div>
					</div>
				</Modal>
			</div>
		);
	}
}