import React from 'react';
import { moneyFormat }  from '@/utils/accounting';
import Button from 'components/button/Button';
import { observer, inject } from 'mobx-react';
import Countdown from 'components/countdown';
import Table from 'components/table/Table';
import Input from 'components/input/Input';
import { FormItem } from 'components/form';
import Modal from 'components/modal';
import classNames from 'classnames';
import { DatePicker }  from 'antd';
import { QQ } from '@/config';
import moment from 'moment';
import api from '@/api';

@inject('store')
@observer
export default class SuppilerHome extends React.Component {
    
    constructor (props) {
        super(props);
        this.state = {
            visible: false,
            companyModal: false,
            averageAnnualInterest: '',
            discountedAmount: '',
            discountedAmountExecuted: '',
            remainingBankQuota: '',
            surplusIdleFunds: '',
            totalBill: '',
            tableData: [],
            approvalList: [],
            totalAmount: '￥0.00',
            avgAccountPeriold: '',
            applicationRate: '',
            invoiceDetail: {},
            invoiceLoading: false,
            invoiceIndex: 0,
            trIndex: 0,
            tableLoading: false,
            tableError: '',
            modalError: ''
            
        };
        this.invoiceList = [];
        this.columns = [
            {
                type: 'selection'
            },
            {
                title: '采购商',
                key: 'companyName'
            },
            {
                title: '可贴现金额',
                key: 'discountedAmount',
                render: params => {
                    if (params.discountedAmount) {
                        return <span className="color-2">{moneyFormat(params.discountedAmount, 2)}</span>
                    } else {
                        return null;
                    }
                }
            },
            {
                title: '发票号',
                key: 'invoiceNum'
            },
            {
                title: '剩余账期',
                key: 'accountPeriold',
                render: params => params.accountPeriold ? params.accountPeriold + '天' : null
            },
            {
                title: '操作',
                key: 'options',
                render: (params, index) => {
                    if (+params.status === 1) {
                        return <Button min onClick={() => this.handleClick(params, index)}>申请贴现</Button>;
                    } else {
                        return <Button disabled min >申请贴现</Button>;
                    }
                }
            }
        ];
    }

    handleClick = ({invoiceId, companyName, invoiceNum}, index) => {
        const { userId } = this.props.store.user;
        this.setState({
            invoiceLoading: true,
            visible: true
        });
        api.getApplyForDiscounting(`userId=${userId}`).then(res => {
            if (res && res.b) {
                this.assignInvoiceList(res.a, invoiceId, companyName, invoiceNum, index);
            } else if (res) {
                this.setState({invoiceLoading: false, modalError: `[${res.i}]：${res.msg}`});
            } else {
                this.setState({invoiceLoading: false, modalError: `请求服务器失败`});
            }
        });
        
    }

    assignInvoiceList = (list, invoiceId, companyName, invoiceNum, trIndex) => {
        let result = {};
        let index = 0;
        this.invoiceList = list;
        for (let i = 0; i < list.length; i++) {
            if (list[i].invoiceNum === invoiceNum) {
                result = list[i];
                index = i;
                break;
            }
        }
        result.companyName = companyName;
        result.invoiceId = invoiceId;
        this.setState({
            invoiceLoading: false,
            invoiceDetail: result,
            invoiceIndex: index,
            trIndex: trIndex
        });
    }

    handlePrev = () => {
        let index = this.state.invoiceIndex - 1;
        if (index < 0) {
            index = 0;
        }
        this.setInvoiceDetail(index);
    }

    handleNext = () => {
        let index = this.state.invoiceIndex + 1;
        if (index > this.invoiceList.length) {
            index = this.invoiceList.length;
        }
        this.setInvoiceDetail(index);
    }

    setInvoiceDetail = (index) => {
        let invoiceDetail = this.invoiceList[index];
        let tableData = this.state.tableData[this.state.trIndex] || {};
        invoiceDetail.companyName = tableData.companyName || '';
        invoiceDetail.invoiceId = tableData.invoiceId;
        this.setState({
            invoiceDetail: invoiceDetail,
            invoiceIndex: index
        });
    }

    onSelect = (rows) => {
        let totalAmount = 0;
        rows.forEach(item => {
            if (item.discountedAmount) {
                totalAmount += item.discountedAmount;
            }
        });
        this.setState({totalAmount: moneyFormat(totalAmount, 2)});
    }

    handleSubmit = (invoiceId) => {
        this.setState({invoiceLoading: true});
        api.updApplyForDiscounting(`invoiceId=${invoiceId}&discountYearInterest=${this.state.discountYearInterest}`).then(res => {
            if (res && res.b) {
                this.setState({
                    invoiceDetail: {},
                    invoiceLoading: false,
                    visible: false
                });
            } else if (res) {
                this.setState({invoiceLoading: false, modalError: `[${res.i}]：${res.msg}`});
            } else {
                this.setState({invoiceLoading: false, modalError: `请求服务器失败`});
            }
        });
    }

    closeModal = () => {
        this.setState({
            modalError: '',
            invoiceDetail: {},
            visible: false
        });
    }

    showCompanyModal = () => {
        this.setState({
            companyModal: true
        });
    }

    closeCompanyModal = () => {
        this.setState({
            name: '',
            email: '',
            companyModal: false
        })
    }

    getCompanyEmail = (email) => {
        this.setState({
            email: email
        });
    }

    getCompanyName = (name) => {
        this.setState({
            name: name
        });
    }

    sendInvitation = () => {
        if (!this.state.name) {
            return;
        }
        if (!this.state.email) {
            return;
        }
        api.sendEmail(`email=${this.state.email}&txt=${this.state.name}`).then(res => {
            this.setState({
                companyModal: false
            });
        });
    }

    componentDidMount () {
        const { companyName, userId } = this.props.store.user;
        api.getPurchasersIndex(`userId=${userId}`).then(res => {
            if (res && res.b) {
                this.setState({...res.a});
            }
        });
        this.setState({tableLoading: true});
        api.getDiscountIndexList(`companyName=${companyName}`).then(res => {
            if (res && res.b) {
                this.setState({
                    tableLoading: false,
                    tableData: res.o
                });
            } else if (res) {
                this.setState({tableLoading: false, tableError: `[${res.i}]：${res.msg}`});
            } else {
                this.setState({tableLoading: false, tableError: `请求服务器失败`});
            }
        });
        api.getApprovalList(`userId=${userId}`).then(res => {
            if (res && res.b) {
                this.setState({
                    approvalList: res.o
                });
            }
        });
    }

    getYearInterest = (value) => {
        this.setState({discountYearInterest: value});
    }

    render () {
        let approvalList = this.state.approvalList.map((item, index) => {
            let status = '';
            if (+item.status === 1) {
                status = '未通过';
            } else if (+item.status === 2) {
                status = '已通过'
            } else if (+item.status === 3) {
                status = '已执行'
            }
            let className = classNames({
                'aside-item': true,
                'aside-item-error': +item.status === 1
            });
            let totalBill = moneyFormat(item.totalBill, 2);
            let acountPeriod = '';
            if (item.acountPeriod && item.acountPeriod >= 60) {
                acountPeriod = parseInt(item.acountPeriod / 60, 10);
                acountPeriod = acountPeriod + '小时前';
            } else {
                acountPeriod = acountPeriod + '分钟前';
            }
            return (
                <div className={className} key={index}>
                    <div className="aside-item-key">
                        <span className="title">{item.companyName}</span>
                        <span className="datetime">{acountPeriod}</span>
                    </div>
                    <div className="aside-item-key">{status}</div>
                    <div className="aside-item-key">获批金额：<span>{totalBill}</span></div>
                    <div className="aside-item-key">获批利率：{item.applicationRate}%</div>
                    {item.status ? null :
                        <Button min onClick={() => this.handleClick(item)}>重新申请</Button>
                    }
                </div>
            )
        });
        let { companyName } = this.props.store.user;
        let {
            invoiceDetail, 
            discountYearInterest,
            invoiceIndex,
            totalBill,
            discountedAmount,
            discountedAmountExecuted
        } = this.state;
        totalBill = moneyFormat(totalBill, 2);
        discountedAmount = moneyFormat(discountedAmount, 2);
        discountedAmountExecuted = moneyFormat(discountedAmountExecuted, 2);
        return (
            <div className="page-main">
                <div className="home">
                    <div className="home-header">
                        <div className="header-title">
                            <div className="header-title-content">{companyName}</div>
                        </div>
                        <div className="header-date">
                            清算倒计时：<Countdown onTimesUp={() => {this.props.store.timesUp()}} />
                        </div>
                    </div>
                    <div className="home-body">
                        <div className="home-body-main">
                            <div className="quota-box box-vertical">
                                <div className="box-horizontally">
                                    <div className="box-horizontally-item">
                                        <div className="key">票据总额</div>
                                    </div>
                                    <div className="box-horizontally-item">
                                        <div className="key">可贴现总额</div>
                                    </div>
                                    <div className="box-horizontally-item">
                                        <div className="key">已执行贴现总额</div>
                                    </div>
                                    <div className="box-horizontally-item">
                                        <div className="key">平均账期</div>
                                    </div>
                                    <div className="box-horizontally-item">
                                        <div className="key">平均年利率</div>
                                    </div>
                                </div>
                                <div className="box-horizontally">
                                    <div className="box-horizontally-item text-1">{totalBill}</div>
                                    <div className="box-horizontally-item value">{discountedAmount}</div>
                                    <div className="box-horizontally-item value">{discountedAmountExecuted}</div>
                                    <div className="box-horizontally-item value">{this.state.avgAccountPeriold ? this.state.avgAccountPeriold + '天' : ''}</div>
                                    <div className="box-horizontally-item text-2">{this.state.averageAnnualInterest || 0}%</div>
                                </div>
                            </div>
                            <div className="toolbar">
                                <span className="toolbar-input">
                                    <Input style={{height: '100%'}} placeholder="拟申请年利率设置" value={this.state.discountYearInterest} onChange={this.getYearInterest} />
                                </span>
                                {/* <button className="btn btn-big" onClick={this.handleClick}>申请贴现</button> */}
                                <div className="toolbar-text">可贴现金额<span className="color-strong">{this.state.totalAmount}</span></div>
                            </div>
                            <div>
                                <div className="block-name">可贴现发票</div>
                                <Table
                                    error={this.state.tableError}
                                    minHeight="200"
                                    maxHeight="500"
                                    loading={this.state.tableLoading}
                                    columns={this.columns}
                                    data={this.state.tableData}
                                    onSelect={this.onSelect} />
                            </div>
                        </div>
                        <div className="box-spacing"></div>
                        <div className="home-body-aside">
                            {approvalList}
                        </div>
                    </div>
                    <div className="home-footer">
                        <a
                            className="kefu"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`http://wpa.qq.com/msgrd?v=3&uin=${QQ}&site=qq&menu=yes`}>
                            专属客服
                        </a>
                        <div className="btn" onClick={this.showCompanyModal}>邀请采购商</div>
                    </div>
                </div>
                <Modal
                    error={this.state.modalError}
                    loading={this.state.invoiceLoading}
                    visible={this.state.visible}
                    style={{width: '640px'}}
                    onClose={this.closeModal}>
                    <FormItem label="采购商">
                        <Input readOnly border value={invoiceDetail.companyName} />
                    </FormItem>
                    <FormItem label="发票号">
                        <Input readOnly border value={invoiceDetail.invoiceNum} />
                    </FormItem>
                    <FormItem label="金额">
                        <Input readOnly border value={moneyFormat(invoiceDetail.money, 2)} />
                    </FormItem>
                    <FormItem label="开票日期">
                        <DatePicker disabledTime value={moment(invoiceDetail.ticketOpeningDate)} style={{width: '100%'}} />
                    </FormItem>
                    <FormItem label="支付日期">
                        <DatePicker disabledTime value={moment(invoiceDetail.paymentDate)} style={{width: '100%'}} />
                    </FormItem>
                    <div className="form-item-group">
                        <FormItem label="当前平均利率">
                            <Input readOnly border value={invoiceDetail.currentAverageInterestRate ? invoiceDetail.currentAverageInterestRate + '%' : ''} />
                        </FormItem>
                        <FormItem label="上期平均利率">
                            <Input readOnly border value={invoiceDetail.averageInterestRatePeriod ? invoiceDetail.averageInterestRatePeriod + '%' : ''} />
                        </FormItem>
                    </div>
                    <FormItem label="贴现申请(年利率)">
                        <Input border value={discountYearInterest} onChange={this.getYearInterest} />
                    </FormItem>
                    <FormItem>
                        <div style={{textAlign: 'center'}}>
                            <Button disabled={invoiceIndex === 0} min style={{marginRight: '20px'}} onClick={this.handlePrev}>上一张</Button>
                            <Button disabled={invoiceIndex === this.invoiceList.length} min onClick={this.handleNext}>下一张</Button>
                        </div>
                    </FormItem>
                    <div>
                        <Button block onClick={() => this.handleSubmit(invoiceDetail.invoiceId)}>提交</Button>
                    </div>
                </Modal>
                <Modal visible={this.state.companyModal} onClose={this.closeCompanyModal}>
                    <ul className="list">
                        <li className="list-item">
                            <Input
                                value={this.state.name}
                                prefix={<i className="icon icon-phone"></i>}
                                placeholder="请输入邀请公司全称"
                                onChange={this.getCompanyName}
                            />
                        
                        </li>
                        <li className="list-item">
                            <Input
                                value={this.state.email}
                                prefix={<i className="icon icon-phone"></i>}
                                placeholder="请输入邀请公司邮箱"
                                onChange={this.getCompanyEmail}
                            />
                        </li>
                    </ul>
                    <div className="modal-footer">
                        <button className="btn" onClick={this.sendInvitation}>发送邀请</button>
                    </div>
                </Modal>
            </div>
        );
    }
}