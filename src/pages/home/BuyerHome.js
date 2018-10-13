import React from 'react';
import { FormItem, FormItemGroup } from 'components/form';
import { Radio, RadioGroup } from 'components/radio';
import { moneyFormat }  from '@/utils/accounting';
import initEcharts  from '@/utils/initEcharts';
import Button from 'components/button/Button';
import { observer, inject } from 'mobx-react';
import Countdown from 'components/countdown';
import Table from 'components/table/Table';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';
import { DatePicker }  from 'antd';
import { QQ } from '@/config';
import moment from 'moment';
import api from '@/api';

@inject('store')
@observer
export default class BuyerHome extends React.Component {

    state = {
        showModal: false,
        status: '',
        payType: '1',
        averageAnnualInterest: '',
        discountedAmount: '',
        discountedAmountExecuted: '',
        remainingBankQuota: '',
        surplusIdleFunds: '',
        totalBill: '',
        tableData: [],
        approvalList: [],
        companyModal: false,
        name: '',
        email: '',
        accountPeriold: '',
        creditBalance: '',
        cumulativeIncome: '',
        idleFunds: '',
        invoiceNumber: '',
        money: '',
        discountYearInterest: '',
        paymentDate: '',
        supplyCompany: '',
        ticketOpeningDate: '',
        invoiceId: '',
        chartData: [],
        invoiceLoading: false,
        tableLoading: false,
        tableError: '',
        modalError: ''
    }

    constructor (props) {
        super(props);
        this.chartEl = React.createRef();
        this.barOption = {
            backgroundColor: '#fff',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['贴现申请金额', '贴现执行金额', '执行年利率']
            },
            grid: {
                left: '0',
                right: '0',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: [],
                axisLabel: {
                    rotate: 45
                },
                splitLine: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                }
            },
            series: [
                {
                    name: '贴现申请金额',
                    type: 'bar',
                    barWidth: 20,
                    itemStyle: {
                        color: '#94e1f0'
                    },
                    data: []
                },
                {
                    name: '贴现执行金额',
                    type: 'bar',
                    barWidth: 20,
                    barGap: '0%',
                    itemStyle: {
                        color: '#5fdeab'
                    },
                    data: []
                },
                {
                    name: '执行年利率',
                    type: 'line',
                    itemStyle: {
                        color: '#fdd000'
                    },
                    data: []
                }
            ]
        }
        this.columns = [
            {
                title: '供应商',
                key: 'companyName'
            },
            {
                title: '申请金额',
                key: 'totalBill',
                render: params => {
                    if (params.totalBill) {
                        return <span className="color-2">{moneyFormat(params.totalBill, 2)}</span>
                    } else {
                        return null;
                    }
                }
            },
            {
                title: '申请利率',
                key: 'applicationRate',
                render: params => params.applicationRate ? params.applicationRate + '%' : null
            },
            {
                title: '剩余账期',
                key: 'accountPeriold',
                render: params => params.accountPeriold ? params.accountPeriold + '天' : null
            },
            {
                title: '状态',
                key: 'discount',
                render: params => {
                    if (+params.approval === 1) {
                        return <span className="color-1">未审批</span>;
                    } else {
                        return <span className="color-1">已审批</span>;
                    }
                }
            },
            {
                title: '操作',
                key: 'options',
                render: params => {
                    if (+params.approval === 1) {
                        return <Button  min onClick={() => this.openModal(params.invoiceId, params.status)}>手动审批</Button>
                    } else {
                        return <Button disabled min>手动审批</Button>
                    }
                }
            }
        ];
        this.echart = null;
    }

    openModal = (invoiceId, status) => {
        api.getManualExamination(`invoiceId=${invoiceId}`).then(res => {
            if (res && res.b) {
                this.setState({...res.a, status, invoiceId, invoiceLoading: false});
            } else if (res) {
                this.setState({invoiceLoading: false, modalError: `[${res.i}]：${res.msg}`});
            } else {
                this.setState({invoiceLoading: false, modalError: `请求服务器失败`});
            }
        });
        this.setState({invoiceLoading: true, showModal: true});
    }

    handleSubmit = () => {
        const { userId } = this.props.store.user;
        this.setState({invoiceLoading: true});
        api.updManualExamination(`userId=${userId}&money=${this.state.money}&invoiceId=${this.state.invoiceId}&status=${this.state.status}`).then(res => {
            if (res && res.b) {
                this.setState({
                    accountPeriold: '',
                    creditBalance: '',
                    idleFunds: '',
                    invoiceNumber: '',
                    money: '',
                    paymentDate: null,
                    supplyCompany: '',
                    ticketOpeningDate: null,
                    invoiceLoading: false,
                    showModal: false
                });
                this.getPurchasersIndexList();
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
            showModal: false
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
        console.log(email);
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

    changeStatus = (value) => {
        this.setState({
            status: value
        });
    }

    changePayType = (value) => {
        this.setState({
            payType: value
        });
    }

    getPurchasersIndexList () {
        const { userId } = this.props.store.user;
        this.setState({tableLoading: true});
        api.getPurchasersIndexList(`userId=${userId}`).then(res => {
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
    }

    componentDidMount () {
        const { userId } = this.props.store.user;
        initEcharts().then(echarts => {
            this.echart = echarts.init(this.chartEl.current);
            this.echart.showLoading();
            api.getTreeShape(`userId=${userId}`).then(res => {
                this.echart.hideLoading();
                if (res && res.b) {
                    this.parsetCharData(res.o);
                }
            });
        });
        api.getPurchasersIndex(`userId=${userId}`).then(res => {
            if (res && res.b) {
                this.setState({...res.a});
            }
        });
        api.getApprovalList(`userId=${userId}`).then(res => {
            if (res && res.b) {
                this.setState({
                    approvalList: res.o
                });
            }
        });
        this.getPurchasersIndexList();
    }

    parsetCharData = (charData) => {
        let xData = [];
        let barData = [];
        let barData2 = [];
        let insterest = [];
        charData.forEach(item => {
            xData.push(moment(item.examineDate).format('YYYY/MM/DD'));
            barData.push(item.money);
            barData2.push(item.moneyExecuted);
            insterest.push(item.discountYearInterest);
        });
        this.barOption.xAxis.data = xData;
        this.barOption.series[0].data = barData;
        this.barOption.series[1].data = barData2;
        this.barOption.series[2].data = insterest;
        if (this.echart) {
            this.echart.setOption(this.barOption);
        }
    }

    render () {
        let approvalList = this.state.approvalList.map((item, index) => {
            let totalBill = moneyFormat(item.totalBill, 2);
            let acountPeriod = '';
            if (item.acountPeriod && item.acountPeriod >= 60) {
                acountPeriod = parseInt(item.acountPeriod / 60, 10);
                acountPeriod = acountPeriod + '小时前';
            } else {
                acountPeriod = acountPeriod + '分钟前';
            }
            return (
                <div className="aside-item" key={index}>
                    <div className="aside-item-key">
                        <span className="title">{item.companyName}</span>
                        <span className="datetime">{acountPeriod}</span>
                    </div>
                    <div className="aside-item-key">申请贴现：<span>{totalBill}</span></div>
                    <div className="aside-item-key">申请利率：{item.applicationRate ? item.applicationRate + '%' : ''}</div>
                    {/* <div className="aside-item-key">第二次报价</div> */}
                </div>
            )
        });
        let { companyName } = this.props.store.user;
        let {
            cumulativeIncome,
            remainingBankQuota,
            surplusIdleFunds,
            discountedAmountExecuted,
            discountedAmount,
            totalBill
        } = this.state;
        cumulativeIncome = moneyFormat(cumulativeIncome, 2);
        remainingBankQuota = moneyFormat(remainingBankQuota, 2);;
        surplusIdleFunds = moneyFormat(surplusIdleFunds, 2);;
        discountedAmountExecuted = moneyFormat(discountedAmountExecuted, 2);;
        discountedAmount = moneyFormat(discountedAmount, 2);;
        totalBill = moneyFormat(totalBill, 2);;
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
                        <div className="home-body-box">
                            <div className="body-box-item">
                                <div className="flex-box flex-box-column">
                                    <div className="flex-box h100">
                                        <div className="quota-box-item relative text-center">
                                            <div>票据总额</div>
                                            <div className="text-1">{totalBill}</div>
                                            <div className="line line-right"></div>
                                        </div>
                                        <div className="quota-box-item relative text-center">
                                            <div>可贴现总额</div>
                                            <div>{discountedAmount}</div>
                                            <div className="line line-right"></div>
                                        </div>
                                        <div className="quota-box-item text-center">
                                            <div>已执行贴现总额</div>
                                            <div>{discountedAmountExecuted}</div>
                                        </div>
                                    </div>
                                    <div className="flex-box h100">
                                        <div className="quota-box-item relative text-center">
                                            <div>平均年利率</div>
                                            <div className="text-2">{this.state.averageAnnualInterest || 0}%</div>
                                            <div className="line line-top"></div>
                                            <div className="line line-right"></div>
                                        </div>
                                        <div className="quota-box-item relative text-center">
                                            <div>剩余闲置资金</div>
                                            <div>{surplusIdleFunds}</div>
                                            <div className="line line-top"></div>
                                            <div className="line line-right"></div>
                                        </div>
                                        <div className="quota-box-item relative text-center">
                                            <div>剩余银行额度</div>
                                            <div>{remainingBankQuota}</div>
                                            <div className="line line-top"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="body-box-item home-body-panel">
                                <div className="total-amount">累计理财收益：<span>{cumulativeIncome}</span></div>
                            </div>
                            <div className="body-box-item home-body-panel">
                                <div ref={this.chartEl} className="chart-wrap"></div>
                            </div>
                            <Table
                                error={this.state.tableError}
                                loading={this.state.tableLoading}
                                minHeight="200"
                                maxHeight="300"
                                columns={this.columns}
                                data={this.state.tableData} />
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
                        <div className="btn" onClick={this.showCompanyModal}>邀请供应商</div>
                    </div>
                </div>
                <Modal
                    error={this.state.modalError}
                    loading={this.state.invoiceLoading}
                    visible={this.state.showModal}
                    title="手动审批"
                    style={{width: '700px'}}
                    onClose={this.closeModal}>
                    <FormItemGroup>
                        <FormItem label="供应公司">
                            <Input readOnly border value={this.state.supplyCompany} />
                        </FormItem>
                        <FormItem label="发票号">
                            <Input readOnly border value={this.state.invoiceNumber} />
                        </FormItem>
                    </FormItemGroup>
                    <FormItemGroup>
                        <FormItem label="发票日期">
                            <DatePicker placeholder="请选择日期" disabledTime value={this.state.ticketOpeningDate ? moment(this.state.ticketOpeningDate) : null} style={{width: '100%'}} />
                        </FormItem>
                        <FormItem label="发票金额">
                            <Input readOnly border value={moneyFormat(this.state.money, 2)} />
                        </FormItem>
                    </FormItemGroup>
                    <FormItemGroup>
                        <FormItem label="支付日期">
                            <DatePicker placeholder="请选择日期" disabledTime value={this.state.paymentDate ? moment(this.state.paymentDate) : null} style={{width: '100%'}} />
                        </FormItem>
                        <FormItem label="申请利率">
                            <Input readOnly border value={this.state.discountYearInterest ? this.state.discountYearInterest + '%' : ''} />
                        </FormItem>
                    </FormItemGroup>
                    <FormItemGroup>
                        <FormItem label="剩余账期">
                            <Input readOnly border value={this.state.accountPeriold ? this.state.accountPeriold + '天' : ''} />
                        </FormItem>
                        <FormItem>
                            <RadioGroup value={this.state.status} onChange={this.changeStatus}>
                                <Radio value={2} style={{marginRight: '20px'}}>同意贴现</Radio>
                                <Radio value={1}>不同意贴现</Radio>
                            </RadioGroup>
                        </FormItem>
                    </FormItemGroup>
                    <FormItemGroup>
                        <FormItem label="剩余闲置金额">
                            <Input readOnly border value={moneyFormat(this.state.idleFunds, 2)} />
                        </FormItem>
                        <FormItem label="剩余银行额度">
                            <Input readOnly border value={moneyFormat(this.state.creditBalance, 2)} />
                        </FormItem>
                    </FormItemGroup>
                    <FormItem>
                        <RadioGroup value={this.state.payType} onChange={this.changePayType} style={{textAlign: 'center'}}>
                            <Radio value="1">闲置资金付款</Radio>
                            <Radio disabled value="2">银行额度付款</Radio>
                        </RadioGroup>
                    </FormItem>
                    <div>
                        <Button block onClick={this.handleSubmit}>提交</Button>
                    </div>
                </Modal>
                <Modal visible={this.state.companyModal} onClose={this.closeCompanyModal}>
                    <ul className="list">
                        <li className="list-item">
                            <Input
                                value={this.state.name}
                                prefix={<i className="icon icon-house"></i>}
                                placeholder="请输入邀请公司全称"
                                onChange={this.getCompanyName}
                            />
                        </li>
                        <li className="list-item">
                            <Input
                                value={this.state.email}
                                prefix={<i className="icon icon-email"></i>}
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