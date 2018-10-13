import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Redirect
} from 'react-router-dom';
import { supplierRouteList, buyerRouteList, routeWhiteList } from './routes';
import asyncComponent from '../components/AsyncComponent';
import Header from '../components/header/Header';
import { observer, inject } from 'mobx-react';
const NotFound = asyncComponent(() => import("../pages/notFound/NotFound"));

@inject('store')
@observer
export default class App extends React.Component {

    render () {
        const token = this.props.store.user.token;
        const userType = this.props.store.user.userType;
        const routeAuthList = +userType === 1 ? buyerRouteList : supplierRouteList;
        return (
            <Router>
                <div className="page-wrap">
                    <Header />
                    <Switch>
                        {routeWhiteList.map(item => {
                            return <Route exact key={item.name} path={item.path} component={item.component} />
                        })}
                        {routeAuthList.map(item => {
                            return <Route exact key={item.name} path={item.path} render={props => 
                                (token ? <item.component {...props} /> : <Redirect to={{pathname: '/login', state: {from: props.location}}} />)
                            } />
                        })}
                        <Route component={NotFound} />
                    </Switch>
                </div>
            </Router>
        );
    }
}