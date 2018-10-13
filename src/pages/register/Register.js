import React from 'react';
import Checkbox from 'components/checkbox/Checkbox';
import Button from 'components/button/Button';
import { observer, inject } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import Input from 'components/input/Input';
import Loading from 'components/loading';
import classNames from 'classnames';
import api from '@/api';

@inject('store')
@observer
export default class Register extends React.Component {

    timer = null;

    maxMinute = 60

    minute = this.maxMinute;

    constructor (props) {
        super(props);
        this.state = {
            companyName: '',
            contact: '',
            mobile: '',
            verifyCode: '',
            email: '',
            password: '',
            confirmPwd: '',
            disabled: false,
            minute: this.maxMinute,
            isAgree: true,
            redirectToReferrer: false,
            type: '',
            message: '',
            base64: '',
            warrant: '',
            businessLicense: '',
            imgUploading: false,
            worldUploading: false,
            worldPreview: '',
			registerSucess: false
        }
    }

    selectType = (type) => {
        this.setState({type: type});
    }

    register = () => {
        if (!this.state.companyName) {
            this.showMessage('请输入公司名称');
            return;
        }
        if (!this.state.contact) {
            this.showMessage('请输入联系人');
            return;
        }
        if (!this.state.mobile) {
            this.showMessage('请输入联系电话');
            return;
        }
        if (!this.state.verifyCode) {
            this.showMessage('请输入验证码');
            return;
        }
        if (!this.state.email) {
            this.showMessage('请输入公司邮箱');
            return;
        }
        if (!this.state.password) {
            this.showMessage('请输入密码');
            return;
        }
        if (this.state.confirmPwd !== this.state.password) {
            this.showMessage('两次密码不一致，请重新输入');
            return;
        }
        if (!this.state.businessLicense) {
            this.showMessage('请上传营业执照');
            return;
        }
        if (!this.state.warrant) {
            this.showMessage('请上传授权书');
            return;
        }
        api.register({
            "companyName": this.state.companyName,
            "contacts": this.state.contact,
            "telephone": this.state.mobile,
            "mailbox": this.state.email,
            "password": this.state.password,
            "type": this.state.type,
            "businessLicense": '营业执照',
            "warrant": '授权书',
            "code": this.state.verifyCode
        }).then(res => {
            console.log(res);
            if (res && res.i) {
                this.showMessage(res.msg);
            } else {
                if (res && res.resultMessage === 'success') {
                    this.setState({registerSucess: true});
                    setTimeout(() => {
                        this.props.store.register({password: this.state.password, account: this.state.companyName, userType: this.state.type});
                        this.props.history.push('/login');
                    }, 1000);
                } else if (res) {
                    this.showMessage(res.resultMessage);
                } else {
                    this.showMessage('请求服务器失败');
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

    queryCode = () => {
        if (!this.state.mobile) {
            this.showMessage('请输入联系电话');
            return;
        }
        this.setState({
            disabled: true
        });
        const REGISTER_TYPE = 1;
        api.sendSMS(`cellphone=${this.state.mobile}&type=${REGISTER_TYPE}`).then(res => {
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

    getCompany = (value) => {
        this.setState({
            companyName: value
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

    getVerifyCode = (value) => {
        this.setState({
            verifyCode: value
        });
    }

    getEmail = (value) => {
        this.setState({
            email: value
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

    handleImage = (e) => {
        const file = e.target.files[0];
        if (file.size / 1024 / 1024 > 2) {
            this.showMessage('上传的图片大小不能超过2M');
            return;
        }
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onloadend = (ev) => {
            this.setState({
                base64: ev.target.result
            });
        }
        this.setState({imgUploading: true});
        const formData = new FormData();
        formData.append('multipartFile', file);
        api.addStock(`imgName=营业执照&type=1`, formData).then(res => {
            this.setState({
                businessLicense: res ? res.msg : '',
                imgUploading: false
            });
        });
    }

    handleFile = (e) => {
        const file = e.target.files[0];
        if (file.size / 1024 / 1024 > 2) {
            this.showMessage('上传的文件大小不能超过2M');
            return;
        }
        this.setState({worldUploading: true});
        const formData = new FormData();
        formData.append('multipartFile', file);
        api.addStock(`imgName=授权书&type=2`, formData).then(res => {
            this.setState({
                warrant: res ? res.msg : '',
                worldUploading: false,
                worldPreview: true
            });
        });
    }

    componentDidMount () {
        const { token } = this.props.store.user;
        if (token) {
            this.setState({
                redirectToReferrer: true
            })
        }
    }

    componentWillUnmount () {
        clearInterval(this.timer);
    }

    agreeContract = (checked) => {
        this.setState({
            isAgree: checked
        });
    }

    render () {
        const { from } = this.props.location.state || {from: {pathname: '/'}};
        const { redirectToReferrer } = this.state;
        if (redirectToReferrer) {
            return <Redirect to={from} />
        }
        const imgReviewCls = classNames({
            'register-upload-review': true,
            'register-upload-hidden': !this.state.base64
        });
        const imgBtnCls = classNames({
            'upload-btn': true,
            'register-upload-hidden': this.state.base64
        });
        const worldReviewCls = classNames({
            'register-upload-review': true,
            'register-upload-hidden': !this.state.worldPreview
        });
        const worldBtnCls = classNames({
            'upload-btn': true,
            'register-upload-hidden': this.state.worldPreview
        });
        return (
            <div className="page-main">
                <div className="register-aside" style={{display: this.state.type !== '' ? 'none': ''}}>
                    <div className="register-type-btn" onClick={() => this.selectType(1)}>注册采购商</div>
                    <div className="register-type-btn" onClick={() => this.selectType(2)}>注册供应商</div>
                </div>
                <div className="register-main" style={{display: this.state.type === '' ? 'none': ''}}>
                    <div className="register">
                        <ul className="list">
                            <li className="list-item">
                                <Input
                                    placeholder="请输入公司全称"
                                    prefix={<i className="icon icon-house"></i>}
                                    onChange={this.getCompany}
                                    value={this.state.companyName}
                                />
                            </li>
                            <li className="list-item">
                                <Input
                                    placeholder="请输入联系人"
                                    prefix={<i className="icon icon-account"></i>}
                                    onChange={this.getContact}
                                    value={this.state.contact}
                                />
                            </li>
                            <li className="list-item">
                                <Input
                                    placeholder="请输入联系电话"
                                    prefix={<i className="icon icon-phone"></i>}
                                    onChange={this.getMobile}
                                    value={this.state.mobile}
                                />
                            </li>
                            <li className="list-item">
                                <Input
                                    placeholder="请输入验证码"
                                    prefix={<i className="icon icon-pwd"></i>}
                                    onChange={this.getVerifyCode}
                                    value={this.state.verifyCode}
                                />
                                <button disabled={this.state.disabled} className="btn-small" onClick={this.queryCode}>
                                    {this.state.disabled ? this.state.minute + '秒' : '获取验证码'}
                                </button>
                            </li>
                            <li className="list-item">
                                <Input
                                    placeholder="请输入公司邮箱"
                                    prefix={<i className="icon icon-email"></i>}
                                    onChange={this.getEmail}
                                    value={this.state.email}
                                />
                            </li>
                            <li className="list-item">
                                <Input
                                    type="password"
                                    placeholder="请输入密码"
                                    prefix={<i className="icon icon-pwd"></i>}
                                    onChange={this.getPassword}
                                    value={this.state.password}
                                />
                            </li>
                            <li className="list-item">
                                <Input
                                    type="password"
                                    placeholder="请确认密码"
                                    prefix={<i className="icon icon-pwd"></i>}
                                    onChange={this.getConfirmPwd}
                                    value={this.state.confirmPwd}
                                />
                            </li>
                        </ul>
                        <div className="error-wrap">
                            <span className="error">{this.state.message}</span>
                        </div>
                        <div className="register-upload">
                            <div className="register-upload-item">
                                <div className="register-upload-title">
                                    <span>营业执照（盖章）</span>
                                    <a
                                        href={require('../../assets/1.jpg')}
                                        target="_blank"
                                        style={{color: '#00b26e', fontSize: '12px'}}>查看示例</a>
                                </div>
                                <Loading loading={this.state.imgUploading}>
                                    <div className={imgReviewCls}>
                                        <img src={this.state.base64} alt="营业执照" />
                                    </div>
                                    <label className={imgBtnCls}>
                                        <input type="file" onChange={this.handleImage} style={{display: 'none'}} accept="image/png, image/jpeg, image/jpg, image/gif" />
                                    </label>
                                </Loading>
                            </div>
                            <div className="register-upload-item">
                                <div className="register-upload-title">
                                    <span>授权书&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                    <a
                                        href={require('../../assets/template.docx')}
                                        download="授权书模板.docx"
                                        style={{color: '#00b26e', fontSize: '12px'}}>模板下载</a>
                                </div>
                                <Loading loading={this.state.worldUploading}>
                                    <div className={worldReviewCls}>
                                        <div className="world-img"></div>
                                    </div>
                                    <label className={worldBtnCls}>
                                        <input type="file" onChange={this.handleFile} style={{display: 'none'}} accept="application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                                    </label>
                                </Loading>
                            </div>
                        </div>
                    </div>
                    <div className="register-footer">
                        <div className="register-footer-content">
                            <div className="contract">
                                <Checkbox checked={this.state.isAgree} size="small" onChange={this.agreeContract}>
                                    同意用户注册协议
                                </Checkbox>
                            </div>
                            <Button onClick={this.register} block>注册</Button>
                        </div>
                    </div>
                </div>
                {this.state.registerSucess ? <div className="register-success">注册成功</div> : null}
            </div>
        );
    }
}