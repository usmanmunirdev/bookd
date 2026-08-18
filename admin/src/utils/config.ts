// require('dotenv').config();
import * as CryptoJS from 'crypto-js';

if (!import.meta.env.VITE_ENCRYPT_DATA_KEY) {
    throw new Error('VITE_ENCRYPT_DATA_KEY environment variable is required');
}

const dataEncryptKey = import.meta.env.VITE_ENCRYPT_DATA_KEY;

export const ENV = {
    serverUrl: process.env.REACT_APP_SERVER_URL,
    fileUrl: process.env.REACT_APP_SERVER_FILE_URL,
    encryptAdminData: function (data: any) {
        if (data?.admin) {
            let encryptInfo = CryptoJS.AES.encrypt(JSON.stringify(data?.admin), dataEncryptKey).toString()
            localStorage.setItem('admin_info', encryptInfo);
        }
        if (data?.token) {
            let encryptToken = CryptoJS.AES.encrypt(JSON.stringify(data?.token), dataEncryptKey).toString()
            localStorage.setItem('admin_token', encryptToken)
        }
    },
    decryptAdminInfo: function (info: any) {
        if (!info) return null;
        if (info) {
            var bytes = CryptoJS.AES.decrypt(info, dataEncryptKey);
            var originalData = bytes.toString(CryptoJS.enc.Utf8);
            originalData = JSON.parse(originalData);
            return originalData;
        }
    },
    decryptAdminToken: function (token: any) {
        if (!token) return null;
        if (token) {
            var bytes = CryptoJS.AES.decrypt(token, dataEncryptKey);
            var originalData = bytes.toString(CryptoJS.enc.Utf8);
            originalData = JSON.parse(originalData);
            return originalData;
        }
    },
    logOut: function () {
        localStorage.removeItem('admin_info')
        localStorage.removeItem('admin_token')
    }
}