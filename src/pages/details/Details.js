import React from 'react';
import { moneyFormat }  from '@/utils/accounting';
import { Menu, MenuItem } from 'components/menu';
import { observer, inject } from 'mobx-react';
import Countdown from 'components/countdown';
import Table from 'components/table/Table';
import { Pagination }  from 'antd';
import moment from 'moment';
import api from '@/api';

@inject('store')
@observer
export default class Details extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            columns: [],
            tableData: [],
            total: 0,
            amountTotal: null,
            tableLoading: false,
            tableError: ''
        };
        this.accountPriod = null;
        this.status = null;
        this.money = null;
        this.columns = [ //采购商
            {
                type: 'selection'
            },
            {
                title: '供应商',
                key: 'invoiceCompanyName'
            },
            {
                title: '发票号',
                key: 'invoiceNum'
            },
            {
                title: '支付日期',
                key: 'paymentDate',
                render: params => params.paymentDate ? moment(params.paymentDate).format('YYYY-MM-DD') : null
            },
            {
                title: '账期',
                key: 'accountPeriod',
                render: params => params.accountPeriod ? params.accountPeriod + '天' : null
            },
            {
                title: '金额',
                key: 'money',
                render: params => {
                    if (params.money) {
                        return <span className="color-2">{moneyFormat(params.money, 2)}</span>;
                    } else {
                        return null;
                    }
                }
            },
            {
                title: '状态',
                key: 'status',
                render: params => {
                    if (+params.status === 1) {
                        return <span className="color-1">可贴现</span>
                    } else if (+params.status === 2) {
                        return <span className="color-1">不可贴现</span>
                    } else if (+params.status === 3) {
                        return <span className="color-1">已执行</span>
                    }
                }
            }
        ];
        this.columns2 = [ //供应商
            {
                type: 'selection'
            },
            {
                title: '采购商',
                key: 'invoiceCompanyName'
            },
            {
                title: '发票号',
                key: 'invoiceNum'
            },
            {
                title: '支付日期',
                key: 'paymentDate',
                render: params => params.paymentDate ? moment(params.paymentDate).format('YYYY-MM-DD') : null
            },
            {
                title: '剩余账期',
                key: 'accountPeriod',
                render: params => params.accountPeriod ? params.accountPeriod + '天' : null
            },
            {
                title: '金额',
                key: 'money',
                render: params => {
                    if (params.money) {
                        return <span className="color-2">{moneyFormat(params.money, 2)}</span>;
                    } else {
                        return null;
                    }
                }
            },
            {
                title: '状态',
                key: 'status',
                render: params => {
                    if (+params.status === 1) {
                        return <span className="color-1">可贴现</span>
                    } else if (+params.status === 2) {
                        return <span className="color-1">不可贴现</span>
                    } else if (+params.status === 3) {
                        return <span className="color-1">已执行</span>
                    }
                }
            }
        ];
    }

    componentDidMount () {
        const { userType } = this.props.store.user;
        let columns = null;
        if (+userType === 1) {
            columns = this.columns;
        } else {
            columns = this.columns2;
        }
        this.setState({
            columns: columns
        });
        this.getDetails();
    }

    getStatus = (value) => {
        this.status = value !== '0' ? value : null;
        this.getDetails();
    }

    getAccountPriod = (value) => {
        this.accountPriod = value !== '0' ? value : null;
        this.getDetails();
    }

    getAmount = (value) => {
        this.money = value !== '0' ? value : null;
        this.getDetails();
    }

    tableSelect = (rows) => {
        let amountTotal = 0;
        rows.forEach(item => {
            amountTotal += item.money;
        });
        this.setState({
            amountTotal: amountTotal.toFixed(2)
        });
    }

    getDetails = (page) => {
        const { userType } = this.props.store.user;
        if (+userType === 1) {
            this.getPurchasersDetails(page);
        } else {
            this.getSupplierDetails(page);
        }
    }

    getSupplierDetails = (page = 1) => {
        const { companyName } = this.props.store.user;
        this.setState({tableLoading: true});
        api.getSupplierDetails({
            "pi": page,
            "ps": 8,
            "invoiceCompanyName": companyName,
            "accountPeriod": this.accountPriod,
            "status": this.status,
            "money": this.money
        }).then(res => {
            if (res && res.b) {
                this.setState({
                    tableLoading: false,
                    tableData: res.a
                });
            } else if (res) {
                this.setState({tableLoading: false, tableError: `[${res.i}]：${res.msg}`});
            } else {
                this.setState({tableLoading: false, tableError: `请求服务器失败`});
            }
        });
    }

    getPurchasersDetails = (page = 1) => {
        const { userId } = this.props.store.user;
        this.setState({tableLoading: true});
        api.getPurchasersDetails({
            "pi": page,
            "ps": 8,
            "userId": userId,
            "accountPeriod": this.accountPriod,
            "status": this.status,
            "money": this.money
        }).then(res => {
            if (res && res.b) {
                this.setState({
                    tableLoading: false,
                    tableData: res.a
                });
            } else {
                this.setState({tableLoading: false, tableError: `[${res.i}]：${res.msg}`});
            }
        });
    }

    pageChange = (page) => {
        this.getDetails(page);
    }

    render() {
        return (
            <div className="page-main">
                <div className="details">
                    <div className="details-header">
                        <div className="header-date">
                            清算倒计时：<Countdown onTimesUp={() => {this.props.store.timesUp()}} />
                        </div>
                    </div>
                    <div className="details-body">
                        <div className="details-aside">
                            <Menu activeKey="0" onSelect={this.getStatus}>
                                <MenuItem key="0">状态</MenuItem>
                                <MenuItem key="1">可贴现</MenuItem>
                                <MenuItem key="2">不可贴现</MenuItem>
                                <MenuItem key="3">已执行</MenuItem>
                            </Menu>
                            <Menu activeKey="0" onSelect={this.getAccountPriod}>
                                <MenuItem key="0">账期</MenuItem>
                                <MenuItem key="30">少于30天</MenuItem>
                                <MenuItem key="40">30-45天</MenuItem>
                                <MenuItem key="50">45-60天</MenuItem>
                                <MenuItem key="60">60天以上</MenuItem>
                            </Menu>
                            <Menu activeKey="0" onSelect={this.getAmount}>
                                <MenuItem key="0">金额</MenuItem>
                                <MenuItem key="1">10万以下</MenuItem>
                                <MenuItem key="5">10-100万</MenuItem>
                                <MenuItem key="25">100-500万</MenuItem>
                                <MenuItem key="75">500-1000万</MenuItem>
                                <MenuItem key="100">1000万以上</MenuItem>
                            </Menu>
                        </div>
                        <div className="details-main">
                            <Table
                                minHeight="200"
                                error={this.state.tableError}
                                loading={this.state.tableLoading}
                                columns={this.state.columns}
                                data={this.state.tableData}
                                onSelect={this.tableSelect} />
                            {
                                this.state.total ? (<div className="table-page">
                                    <Pagination
                                        showTotal={total => `共${total}条`}
                                        defaultCurrent={1}
                                        onChange={this.pageChange}
                                        total={this.state.total} />
                                </div>) : null
                            }
                            <div className="details-main-footer">合计金额：<span>￥{this.state.amountTotal || '0.00'}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}