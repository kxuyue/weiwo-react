import React from 'react';
import { FormItem, FormItemGroup } from 'components/form';
import { Radio, RadioGroup } from 'components/radio';
import InputGroup from 'components/input/InputGroup';
import Button from 'components/button/Button';
import { observer, inject } from 'mobx-react';
import Countdown from 'components/countdown';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';
import Loading from 'components/loading';
import classNames from 'classnames';
import { DatePicker } from 'antd';
import moment from 'moment';
import api from '@/api';

@inject('store')
@observer
export default class Upload extends React.Component {

    state = {
        visibleModal: false,
        bankName: '',
        balance: '',
        purchasersId: '',
        idleFunds: '',
        projectedTime: null,
        minRate: '',
        maxRate: '',
        invoiceNum: '',
        invoiceDate: null,
        paymentDate: null,
        purchaserName: '',
        totalAmount: '',
        uploading: false,
        error: '',
        status: '',
        bankList: [],
        diableSubmit: true,
        disableBankSubmit: true,
        disableUpload: false,
        saveing: false,
        disableSaveInvoice: true,
        modalError: '',
        dropdown: false,
        selectTitle: '新增'
    }

    addType = 1;

    onpenSelect = () => {
        this.setState({dropdown: true});
    }

    closeSelect = () => {
        this.setState({dropdown: false});
    }

    getAddType = (type) => {
        this.addType = type;
        if (type === 1) {
            this.setState({selectTitle: '新增'});
        } else {
            this.setState({selectTitle: '扣除'});
        }
        this.setState({dropdown: false});
    }

    radioChange = (value) => {
        let disableSaveInvoice = true;
        if (value && this.state.invoiceNum && this.state.invoiceDate && this.state.totalAmount && this.state.purchaserName && this.state.paymentDate) {
            disableSaveInvoice = false;
        }
        this.setState({
            disableSaveInvoice: disableSaveInvoice,
            status: value
        });
    }

    handleFile = (e) => {
        // 调用百度AI进行图片识别
        let fileReader = new FileReader();
        let file = e.target.files[0];
        if (file.size / 1024 / 1024 > 2) {
            this.showMessage('选择文件大小不能超过2M');
            return;
        }
        fileReader.readAsDataURL(file);
        let accessToken = this.props.store.baiduOcr.accessToken;
        this.setState({ uploading: true, disableUpload: true });
        fileReader.onloadend = (e) => {
            let match = /data:image\/[a-zA-Z]+;base64,/
            let imgBase64 = e.target.result.replace(match, '');
            fetch(`/rest/2.0/ocr/v1/vat_invoice?access_token=${accessToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams([["image", imgBase64]]).toString()
            }).then(res => {
                return res.json();
            }).then(res => {
                if (res.error_code) {
                    this.setState({
                        uploading: false,
                        disableUpload: false
                    });
                    this.showMessage('上传出错，请手动添加');
                } else {
                    const {InvoiceNum, SellerName, AmountInFiguers, InvoiceDate} = res.words_result;
                    let invoiceDate = null;
                    try {
                        invoiceDate = moment(InvoiceDate, 'YYYY年MM月DD日')
                    } catch (error) {
                        console.error(error);
                    }
                    let disableSaveInvoice = true;
                    if (InvoiceNum && invoiceDate && SellerName && AmountInFiguers && this.state.paymentDate && this.state.status) {
                        disableSaveInvoice = false;
                    }
                    this.setState({
                        disableSaveInvoice: disableSaveInvoice,
                        invoiceNum: InvoiceNum,
                        invoiceDate: invoiceDate,
                        purchaserName: SellerName,
                        totalAmount: AmountInFiguers,
                        visibleModal: true,
                        uploading: false,
                        disableUpload: false
                    });
                }
            }).catch(error => {
                this.setState({
                    uploading: false,
                    disableUpload: false
                });
                this.showMessage('上传出错，请手动添加');
            });
        }
        e.target.value = null;
    }

    getInvoiceDate = (date) => {
        let disableSaveInvoice = true;
        if (date && this.state.invoiceNum && this.state.totalAmount && this.state.purchaserName && this.state.paymentDate && this.state.status) {
            disableSaveInvoice = false;
        }
        this.setState({
            disableSaveInvoice: disableSaveInvoice,
            invoiceDate: date
        });
    }

    getInvoiceNum = (value) => {
        let disableSaveInvoice = true;
        if (value && this.state.invoiceDate && this.state.totalAmount && this.state.purchaserName && this.state.paymentDate && this.state.status) {
            disableSaveInvoice = false;
        }
        this.setState({
            disableSaveInvoice: disableSaveInvoice,
            invoiceNum: value
        });
    }

    getPurchaserName = (value) => {
        let disableSaveInvoice = true;
        if (value && this.state.invoiceNum && this.state.invoiceDate && this.state.totalAmount && this.state.paymentDate && this.state.status) {
            disableSaveInvoice = false;
        }
        this.setState({
            disableSaveInvoice: disableSaveInvoice,
            purchaserName: value
        });
    }

    getTotalAmount = (value, e) => {
        let disableSaveInvoice = true;
        if (value && this.state.invoiceNum && this.state.invoiceDate && this.state.purchaserName && this.state.paymentDate && this.state.status) {
            disableSaveInvoice = false;
        }
        this.setState({
            disableSaveInvoice: disableSaveInvoice,
            totalAmount: value
        });
    }

    getPaymentDate = (date) => {
        let disableSaveInvoice = true;
        if (date && this.state.invoiceNum && this.state.invoiceDate && this.state.totalAmount && this.state.purchaserName  && this.state.status) {
            disableSaveInvoice = false;
        }
        this.setState({
            disableSaveInvoice: disableSaveInvoice,
            paymentDate: date
        });
    }

    openModal = () => {
        let disableSaveInvoice = true;
        if (this.state.invoiceNum && this.state.invoiceDate && this.state.purchaserName && this.state.totalAmount && this.state.paymentDate && this.state.status) {
            disableSaveInvoice = false;
        }
        this.setState({
            disableSaveInvoice: disableSaveInvoice,
            visibleModal: true
        });
    }

    closeModal = () => {
        this.setState({
            purchaserName: '',
            invoiceDate: null,
            invoiceNum: '',
            totalAmount: '',
            paymentDate: null,
            status: '',
            modalError: '',
            visibleModal: false
        });
    }

    getBankName = (value) => {
        if (this.state.creditBalance && value) {
            this.setState({
                disableBankSubmit: false
            });
        } else {
            this.setState({
                disableBankSubmit: true
            });
        }
        this.setState({
            bankName: value
        });
    }

    getCreditBalance = (value) => {
        if (this.state.bankName && value) {
            this.setState({
                disableBankSubmit: false
            });
        } else {
            this.setState({
                disableBankSubmit: true
            });
        }
        this.setState({
            balance: value
        });
    }

    bankSubmit = () => {
        api.addCreditBank({
            "creditBankName": this.state.bankName,
            "creditBalance": this.state.balance,
            "purchasersId": this.state.purchasersId
        }).then(res => {
            if (res && res.a) {
                let bank = {
                    bankName: this.state.bankName,
                    balance: this.state.balance
                };
                let bankList = this.state.bankList;
                bankList.push(bank);
                this.setState({
                    bankName: '',
                    balance: '',
                    disableBankSubmit: true,
                    bankList: bankList
                });
            }
        });
    }

    getProjectedTime = (value) => {
        if (this.state.idleFunds && this.state.minRate && this.state.maxRate && value) {
            this.setState({
                diableSubmit: false
            });
        } else {
            this.setState({
                diableSubmit: true
            });
        }
        this.setState({
            projectedTime: value
        });
    }

    getIdleFunds = (value) => {
        if (this.state.projectedTime && this.state.minRate && this.state.maxRate && value) {
            this.setState({
                diableSubmit: false
            });
        } else {
            this.setState({
                diableSubmit: true
            });
        }
        this.setState({
            idleFunds: value
        });
    }

    getMinRate = (value) => {
        if (this.state.idleFunds && this.state.projectedTime && this.state.maxRate && value) {
            this.setState({
                diableSubmit: false
            });
        } else {
            this.setState({
                diableSubmit: true
            });
        }
        this.setState({
            minRate: value
        });
    }

    getMaxRate = (value) => {
        if (this.state.idleFunds && this.state.minRate && this.state.projectedTime && value) {
            this.setState({
                diableSubmit: false
            });
        } else {
            this.setState({
                diableSubmit: true
            });
        }
        this.setState({
            maxRate: value
        });
    }

    submit = () => {
        const { userId } = this.props.store.user;
        let idleFunds = this.state.idleFunds;
        if (this.addType === 2) {
            idleFunds = -idleFunds;
        }
        api.addPurchasersDesc({
            "idleFunds": idleFunds,
            "projectedTime": this.state.projectedTime.valueOf(),
            "expectedMaxInterest": this.state.maxRate ? this.state.maxRate / 100 : 0,
            "expectedMinInterest": this.state.minRate ? this.state.minRate / 100 : 0,
            "userId": userId
        }).then(res => {
            if (res && res.b) {
                this.setState({
                    idleFunds: '',
                    projectedTime: null,
                    maxRate: '',
                    minRate: '',
                    diableSubmit: false
                });
            }
        });
    }

    saveInvoice = () => {
        const { userId } = this.props.store.user;
        this.setState({saveing: true});
        api.addInvoice({
            "invoiceCompanyName": this.state.purchaserName,
            "invoiceNum": this.state.invoiceNum,
            "money": this.state.totalAmount.replace('￥', '').replace(',', ''),
            "ticketOpeningDate": this.state.invoiceDate.valueOf(),
            "paymentDate": this.state.paymentDate.valueOf(),
            "status": this.state.status,
            "userId": userId
        }).then(res => {
            if (res && res.b) {
                this.setState({
                    purchaserName: '',
                    invoiceDate: null,
                    invoiceNum: '',
                    totalAmount: '',
                    paymentDate: null,
                    status: '',
                    saveing: false,
                    visibleModal: false
                });
            } else if (res) {
                this.setState({saveing: false, modalError: `[${res.i}]：${res.msg}`});
            } else {
                this.setState({saveing: false, modalError: `请求服务器失败`});
            }
        });
    }

    showMessage = (message, duration) => {
        this.clearTimer();
        this.setState({
            error: message
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
                error: ''
            });
            this.closeTimer = null;
        }
    }

    render() {
        const bankListEl = this.state.bankList.map((item, i) => {
            return (
                <FormItemGroup key={item.bankName + i}>
                    <FormItem inline style={{ width: '200px' }}>{item.bankName}</FormItem>
                    <FormItem inline style={{ width: '200px' }}>￥{item.balance}</FormItem>
                </FormItemGroup>
            );
        });
        let selectCls = classNames({
            'input-select': true,
            'input-select-show': this.state.dropdown
        });
        return (
            <div className="page-main">
                <div className="details">
                    <div className="details-header">
                        <div className="header-date">
                            清算倒计时：<Countdown onTimesUp={() => { this.props.store.timesUp() }} />
                        </div>
                    </div>
                    <div className="details-body bg-white">
                        <div className="setting-main">
                            <div className="row">
                                <FormItemGroup style={{ width: '500px' }}>
                                    <FormItem inline label="闲置资金" style={{ width: '200px' }}>
                                        <InputGroup>
                                            <div className={selectCls}>
                                                <div className="input-select-header" onMouseEnter={this.onpenSelect} onMouseLeave={this.closeSelect}>
                                                    <span className="title">{this.state.selectTitle}</span>
                                                    <span className="arrow"><svg viewBox="64 64 896 896" data-icon="down" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"></path></svg></span>
                                                </div>
                                                <div className="input-select-dropdown" onMouseEnter={this.onpenSelect} onMouseLeave={this.closeSelect}>
                                                    <div className="item" onClick={() => this.getAddType(1)}>新增</div>
                                                    <div className="item" onClick={() => this.getAddType(2)}>扣除</div>
                                                </div>
                                            </div>
                                            <Input select border value={this.state.idleFunds} placeholder="请输入金额" onChange={this.getIdleFunds} />
                                        </InputGroup>
                                    </FormItem>
                                    <FormItem inline label="拟投放时间" style={{ width: '200px' }}>
                                        <DatePicker value={this.state.projectedTime} placeholder="请输入时间" onChange={this.getProjectedTime} style={{ width: '100%' }} />
                                    </FormItem>
                                </FormItemGroup>
                            </div>
                            <div className="row">
                                <FormItemGroup style={{ width: '400px', alignItems: 'flex-end' }}>
                                    <FormItem inline label="期望年利率区间" style={{ width: '200px' }}>
                                        <Input border value={this.state.minRate} placeholder="请输入最小年利率" onChange={this.getMinRate} />
                                    </FormItem>
                                    <FormItem inline style={{ width: '200px' }}>
                                        <Input border value={this.state.maxRate} placeholder="请输入最大年利率" onChange={this.getMaxRate} />
                                    </FormItem>
                                </FormItemGroup>
                                <Button disabled={this.state.diableSubmit} min onClick={this.submit}>提交</Button>
                            </div>
                            <div className="row">
                                <FormItemGroup style={{ width: '400px', alignItems: 'flex-end' }}>
                                    <FormItem inline label="授信银行" style={{ width: '200px' }}>
                                        <Input value={this.state.bankName} border placeholder="请输入银行名称" onChange={this.getBankName} />
                                    </FormItem>
                                    <FormItem inline label="授信余额" style={{ width: '200px' }}>
                                        <Input value={this.state.balance} border placeholder="请输入授信余额" onChange={this.getCreditBalance} />
                                    </FormItem>
                                </FormItemGroup>
                                <Button disabled={this.state.disableBankSubmit} min onClick={this.bankSubmit}>提交</Button>
                            </div>
                            <div>
                                {bankListEl}
                            </div>
                            <FormItemGroup style={{ alignItems: 'flex-end' }}>
                                <FormItem inline label="发票单据">
                                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        <Loading loading={this.state.uploading}>
                                            <label className="upload-btn">
                                                <input
                                                    type="file"
                                                    onChange={this.handleFile}
                                                    style={{ display: 'none' }}
                                                    accept="image/png, image/jpeg, image/jpg" />
                                            </label>
                                        </Loading>
                                        <div style={{ marginLeft: '20px' }}>
                                            <div className="error-wrap">
                                                <div className="error">{this.state.error}</div>
                                            </div>
                                            <Button disabled={this.state.disableUpload} small onClick={this.openModal}>手动添加</Button>
                                        </div>
                                    </div>
                                </FormItem>
                            </FormItemGroup>
                        </div>
                    </div>
                </div>
                <Modal
                    error={this.state.modalError}
                    loading={this.state.saveing}
                    visible={this.state.visibleModal}
                    onClose={this.closeModal}
                    style={{ width: '300px' }}>
                    <FormItem label="供应公司">
                        <Input border value={this.state.purchaserName} onChange={this.getPurchaserName} />
                    </FormItem>
                    <FormItem label="发票号">
                        <Input border value={this.state.invoiceNum} onChange={this.getInvoiceNum} />
                    </FormItem>
                    <FormItem label="金额">
                        <Input border value={this.state.totalAmount} onChange={this.getTotalAmount} />
                    </FormItem>
                    <FormItem label="开票日期">
                        <DatePicker value={this.state.invoiceDate} placeholder="请输入开票日期" onChange={this.getInvoiceDate} style={{ width: '100%' }} />
                    </FormItem>
                    <FormItem label="支付日期">
                        <DatePicker value={this.state.paymentDate} placeholder="请输入支付日期" onChange={this.getPaymentDate} style={{ width: '100%' }} />
                    </FormItem>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <RadioGroup value={this.state.status} onChange={this.radioChange}>
                            <Radio value="1" style={{ marginRight: '30px' }}>可贴现</Radio>
                            <Radio value="2">不可贴现</Radio>
                        </RadioGroup>
                    </div>
                    <div>
                        <Button disabled={this.state.disableSaveInvoice} block onClick={this.saveInvoice}>确认</Button>
                    </div>
                </Modal>
            </div>
        );
    }
}