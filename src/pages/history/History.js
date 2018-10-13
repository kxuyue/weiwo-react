import React from 'react';
import { Menu, MenuItem } from 'components/menu';
import { moneyFormat }  from '@/utils/accounting';
import { observer, inject } from 'mobx-react';
import Countdown from 'components/countdown';
import Table from 'components/table/Table';
import Input from 'components/input/Input';
import { Pagination }  from 'antd';
import moment from 'moment';
import api from '@/api';

@inject('store')
@observer
export default class History extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            tableData: [],
            total: 0,
            page: 1,
            dayNumber: 7,
            pageSize: 10,
            accountPeriod: '',
            tableLoading: false,
            tableError: ''
        };
        this.accountPeriod = '';
        this.columns = [
            {
                title: '日期',
                key: 'examineDate',
                render: params => params.examineDate ? moment(params.examineDate).format('YYYY-MM-DD') : null
            },
            {
                title: '发票号',
                key: 'invoiceNum'
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
                title: '执行账期',
                key: 'accountPeriod',
                render: params => params.accountPeriod ? params.accountPeriod + '天' : null
            },
            {
                title: '执行年利率',
                key: 'discountYearInterest',
                render: params => params.discountYearInterest ? params.discountYearInterest + '%' : null
            },
            {
                title: '议价次数',
                key: 'count'
            }
        ];
    }

    goDetail = (e, params) => {
        console.log(params);
    }

    componentDidMount () {
        this.getHistoryList(7, 1);
    }

    onMenuSelect = (value) => {
        this.getHistoryList(value, 1);
    }

    onInput = (value) => {
        this.setState({accountPeriod: value});
        this.accountPeriod = value;
    }

    onBlur = () => {
        if (this.accountPeriod) {
            this.getHistoryList(this.accountPeriod, 1);
        }
    }

    pageChange = (page) => {
        this.getHistoryList(this.state.dayNumber, page);
    }

    getHistoryList = (value, page) => {
        const { userId } = this.props.store.user;
        this.setState({tableLoading: true});
        api.getHistory(`accountPeriod=${value}&userId=${userId}`, {
            "pi": page,
            "ps": this.state.pageSize
        }).then(res => {
            if (res && res.b) {
                this.setState({
                    tableLoading: false,
                    tableData: res.a,
                    total: res.o.total
                });
            } else if (res) {
                this.setState({tableLoading: false, tableError: `[${res.i}]：${res.msg}`});
            } else {
                this.setState({tableLoading: false, tableError: `请求服务器失败`});
            }
        });
    }

    render () {
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
                        <Menu onSelect={this.onMenuSelect} title="天数查询">
                            <MenuItem key="7">7天内</MenuItem>
                            <MenuItem key="30">30天内</MenuItem>
                            <MenuItem key="60">60天内</MenuItem>
                            <MenuItem key="90">90天以上</MenuItem>
                            <MenuItem disabled key="100">
                                <div style={{width: '100px'}}>
                                    <Input border placeholder="自定义" value={this.state.accountPeriod} onChange={this.onInput} onBlur={this.onBlur} />
                                </div>
                            </MenuItem>
                        </Menu>
                        </div>
                        <div className="details-main">
                            <Table
                                minHeight="200"
                                error={this.state.tableError}
                                loading={this.state.tableLoading}
                                columns={this.columns}
                                data={this.state.tableData} />
                            {
                                this.state.total ? (<div className="table-page">
                                    <Pagination
                                        showTotal={total => `共${total}条`}
                                        defaultCurrent={1}
                                        onChange={this.pageChange}
                                        total={this.state.total} />
                                </div>) : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}