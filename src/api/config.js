
import { host } from '../config';

export default  {
    login: {
        method: 'POST',
        url: host + '/loginUser'
    },
    register: {
        method: 'POST',
        url: host + '/insertUser'
    },
    updateUser: {
        method: 'POST',
        url: host + '/updateUser'
    },
    updatePassword: {
        method: 'POST',
        url: host + '/updUserPwd'
    },
    retrievePwd: {
        method: 'POST',
        url: host + '/retrievePwd'
    },
    getHistory: {
        method: 'POST',
        url: host + '/getSupplierHistory'
    },
    getSupplierDetails: {
        method: 'POST',
        url: host + '/getSupplierDetails'
    },
    getPurchasersDetails: {
        method: 'POST',
        url: host + '/getPurchasersDetails'
    },
    addCreditBank: {
        method: 'POST',
        url: host + '/insertCreditBank'
    },
    addPurchasersDesc: {
        method: 'POST',
        url: host + '/insertPurchasersDesc'
    },
    getBaiduOcr: {
        method: 'POST',
        url: 'https://aip.baidubce.com/oauth/2.0/token'
    },
    addInvoice: {
        method: 'POST',
        url: host + '/insertInvoice'
    },
    sendSMS: {
        method: 'POST',
        url: host + '/sendSMS'
    },
    getIApperProcess: {
        method: 'POST',
        url: host + '/getIApperProcess'
    },
    getIApperovalProcessList: {
        method: 'POST',
        url: host + '/getIApperovalProcessList'
    },
    getApprovalList: {
        method: 'POST',
        url: host + '/getApprovalList'
    },
    getPurchasersIndex: {
        method: 'POST',
        url: host + '/getPurchasersIndex'
    },
    getPurchasersIndexList: {
        method: 'POST',
        url: host + '/getPurchasersIndexList'
    },
    getDiscountIndexList: {
        method: 'POST',
        url: host + '/getDiscountIndexList'
    },
    addStock: {
        method: 'POST',
        url: host + '/addStock',
        headers: {}
    },
    sendEmail: {
        method: 'POST',
        url: host + '/sendEmail'
    },
    getManualExamination: {
        method: 'POST',
        url: host + '/getManualExamination'
    },
    updManualExamination: {
        method: 'POST',
        url: host + '/updManualExamination'
    },
    getApplyForDiscounting: {
        method: 'POST',
        url: host + '/getApplyForDiscounting'
    },
    updApplyForDiscounting: {
        method: 'POST',
        url: host + '/updApplyForDiscounting'
    },
    getTreeShape: {
        method: 'POST',
        url: host + '/getTreeShape'
    },
    updApperovalState: {
        method: 'POST',
        url: host + '/updApperovalState'
    }
}