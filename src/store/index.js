import { observable, action, runInAction } from 'mobx';
import { APIKey, SecretKey } from '../config';
import Cookies from 'js-cookie';
import api from '../api';

export default class Store {
    @observable state = "pending";
    @observable visible = false;
    @observable registerInfo = {};
    @observable loading = false;
    @observable tableData = [];
    @observable auditInfo = {};
    @observable baiduOcr = {};
    @observable user = {};
    
    constructor () {
        let userStr = Cookies.get('user');
        try {
            if (userStr) {
                this.user = JSON.parse(userStr);
            }
        } catch (error) {
            console.error(error);
        }
        this.getBaiduToken();
    }

    @action getBaiduToken () {
        let str = Cookies.get('baiduOcr');
        try {
            if (str) {
                this.baiduOcr = JSON.parse(str);
            } else {
                fetch('/oauth/2.0/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams([['grant_type', 'client_credentials'], ["client_id", APIKey], ['client_secret', SecretKey]]).toString()
                }).then(res => {
                    return res.json();
                }).then(res => {
                    this.baiduOcr = res;
                    let day = res.expires_in / 86400;
                    Cookies.set('baiduOcr', JSON.stringify({'accessToken': res.access_token}), {expires: day});
                });
            }
        } catch (error) {
            console.error(error);
        }
        
    }

    @action login (user, day) {
        let userStr = '';
        try {
            userStr = JSON.stringify(user);
            if (day) {
                Cookies.set('user', userStr, {expires: day});
            } else {
                Cookies.set('user', userStr);
            }
            this.user = user;
        } catch (error) {
            console.error(error);
        }
    }

    @action updateEmail (email) {
        this.user.email = email;
        let userStr = '';
        try {
            userStr = JSON.stringify(this.user);
            Cookies.set('user', userStr);
        } catch (error) {
            console.error(error);
        }
    }

    @action updateMobile (mobile) {
        this.user.mobile = mobile;
        let userStr = '';
        try {
            userStr = JSON.stringify(this.user);
            Cookies.set('user', userStr);
        } catch (error) {
            console.error(error);
        }
    }

    @action updateContact (contact) {
        this.user.contact = contact;
        let userStr = '';
        try {
            userStr = JSON.stringify(this.user);
            Cookies.set('user', userStr);
        } catch (error) {
            console.error(error);
        }
    }

    @action logout () {
        Cookies.remove('user');
        this.user = {};
    }

    @action changeVisible (status) {
        this.visible = status;
    }

    @action
    async fetchAuditInfo () {
        const {userId} = this.user;
        this.loading = true;
        try {
            let auditInfo = await api.getIApperProcess(`userId=${userId}&status=1`);
            let tableData = await api.getIApperovalProcessList(`userId=${userId}`);
            runInAction(() => {
                this.auditInfo = auditInfo && auditInfo.b ? auditInfo.a : {};
                this.tableData = tableData && tableData.b ? tableData.o : [];
                this.state = 'done';
                this.loading = false;
            });
        } catch (error) {
            runInAction(() => {
                this.loading = false;
                this.state = 'error';
            });
        }
    }

    @action timesUp () {
        this.changeVisible(true);
        this.fetchAuditInfo();
    }

    @action register (info) {
        this.registerInfo = info;
    }
}