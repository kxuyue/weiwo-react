import React from 'react';
import Checkbox from '../checkbox/Checkbox';
import Loading from '../loading';

export default class Table extends React.Component {

    static defaultProps = {
        columns: [],
        data: []
    };

    constructor (props) {
        super(props);
        this.state = {
            columns: this.props.columns,
            data: this.props.data,
            selectAll: false
        };
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
            data: nextProps.data,
            columns: nextProps.columns
        });
    }

    onSelectAll = () => {
        let data = this.state.data.map(data => {
            data.isSelect = !this.state.selectAll;
            return data;
        });
        this.setState({
            data: data,
            selectAll: !this.state.selectAll
        });
        let selections = data.filter(data => {
            if (data.isSelect) {
                return data;
            } else {
                return null;
            }
        });
        if (this.props.onSelect) {
            this.props.onSelect(selections);
        }
    }

    onSelect = (checked, data) => {
        let index = this.state.data.indexOf(data);
        data.isSelect = checked;
        this.state.data.splice(index, 1, data);
        let datas = this.state.data;
        let selections = datas.filter(data => data.isSelect);
        this.setState({
            data: datas,
            selectAll: datas.length === selections.length
        });
        if (this.props.onSelect) {
            this.props.onSelect(selections);
        }
    }

    renderHeader () {
        return this.state.columns.map((column, index) => {
            if (column.type === 'selection') {
                return (
                    <th key={'selection' + index}>
                        <Checkbox checked={this.state.selectAll} onChange={this.onSelectAll} />
                    </th>
                );
            } else {
                return <th key={column.key + 'index'}>{column.title}</th>;
            }
        });
    }

    renderTr (columns, data, trIndex) {
        return columns.map((column, index) => {
            if (column.type === 'selection') {
                return (
                    <td key={'body-selection' + index}>
                        <Checkbox checked={data.isSelect} onChange={(checked) => this.onSelect(checked, data)} />
                    </td>
                );
            } else {
                if (column.render) {
                    return <td key={'td' + column.key + index}><div className="cell" title={column.render(data, trIndex)}>{column.render(data, trIndex)}</div></td>;
                } else {
                    return <td key={'td' + column.key + index}><div className="cell" title={data[column.key]}>{data[column.key]}</div></td>;
                }
            }
        });
    }

    renderBody () {
        const { minHeight, maxHeight } = this.props;
        let style = {};
        if (minHeight) {
            style.minHeight = minHeight + 'px';
        }
        if (maxHeight) {
            style.maxHeight = maxHeight + 'px';
        }
        let error = '暂无数据';
        if (this.props.error) {
            error = this.props.error;
        }
        if (this.state.data.length === 0) {
            if (this.props.loading) {
                error = '数据加载中';
            }
            return <div className="table-body-empty" style={style}><div className="content" style={{height: this.props.minHeight + 'px'}}>{error}</div></div>
        } else {
            let body = this.state.data.map((data, index) => {
                return <tr key={'tr' + index}>{this.renderTr(this.state.columns, data, index)}</tr>
            });
            return (
                <div className="table-body" style={style}>
                    <table>
                        <tbody>
                            {body}
                        </tbody>
                    </table>
                </div>
            );
        }
    }
    
    render () {
        return (
            <div className="table-wrap">
                <div className="table">
                    <div className="table-header">
                        <table>
                            <thead>
                                <tr>
                                    {this.renderHeader()}
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <Loading loading={this.props.loading}>
                        {this.renderBody()}
                    </Loading>
                </div>
            </div>
        );
    }
}