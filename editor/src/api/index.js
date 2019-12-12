import axios from 'axios';
const baseURL = 'http://localhost:3000/';
// const baseURL = 'http://210.75.9.165:8766/v1/';
const http = axios.create({
  baseURL: baseURL,
  withCredentials: false,
  timeout: 30000,
  headers: {
    // 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    'Content-Type': 'application/json'
  }
  // transformRequest: [
  //   function(data) {
  //     let newData = '';
  //     for (const k in data) {
  //       if (data.hasOwnProperty(k) === true) {
  //         newData +=
  //           encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) + '&';
  //       }
  //     }
  //     return newData;
  //   }
  // ]
});
// 添加请求拦截增加令牌
http.interceptors.request.use(
  config => {
    if (window.localStorage.loginInfo) {
      config.headers.authorization = JSON.parse(window.localStorage.loginInfo).AccessToken;
    }
    // config.headers.authorization = 'Bearer FIKEB3EJMPO8N89S7-FPHG';
    return config;
  },
  err => {
    return Promise.reject(err);
  });
http.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      // console.log(error.response);
      switch (error.response.status) {
        case 401:
          if (window.localStorage.loginInfo) {
            Toast('身份验证失败,请重试');
            const loginInfo = JSON.parse(window.localStorage.loginInfo);
            var url = baseURL + 'oauth2/token?grant_type=client_credentials&client_id=' + loginInfo.employeeno + '&client_secret=' + loginInfo.phone + '&scope=read';
            axios.get(url)
            .then(function(response) {
              const logininfo = {
                employeeno: loginInfo.employeeno,
                employeename: loginInfo.employeename,
                departmentId: loginInfo.departmentId,
                phone: loginInfo.phone,
                MockCode: loginInfo.MockCode,
                MyBrand: loginInfo.MyBrand,
                myCompany: loginInfo.myCompany,
                myAreas: loginInfo.myAreas,
                myPermission: loginInfo.myPermission,
                IsSetPwd: loginInfo.IsSetPwd,
                WorkState: loginInfo.WorkState,
                PhotoUrl: loginInfo.PhotoUrl,
                MyLargeArea: loginInfo.MyLargeArea,
                MyShop: loginInfo.MyShop,
                MyOffice: loginInfo.MyOffice,
                MyRole: loginInfo.MyRole,
                Tag: loginInfo.Tag,
                AccessToken: 'Bearer ' + response.data.access_token
              };
              window.localStorage.setItem('loginInfo', JSON.stringify(logininfo));
            })
            .catch(function(error) {
              console.log(error);
            });
          }
      }
    } else {
      if (navigator.onLine) {
        // Toast('请求超时，请稍后重试');
      } else {
        // Toast('网络访问失败，请检查网络设置');
      }
    }
    return Promise.reject(error.response.data);
  });
function apiAxios(method, url, params, response) {
  http({
    method: method,
    url: url,
    data: method === 'POST' || method === 'PUT' ? params : null,
    params: method === 'GET' || method === 'DELETE' ? params : null
  })
    .then(function(res) {
      response(res);
    })
    .catch(function(err) {
      response(err);
      // Toast('服务器正在维护中');
    });
}

export default {
  get: function(url, params, response) {
    return apiAxios('GET', url, params, response);
  },
  post: function(url, params, response) {
    return apiAxios('POST', url, params, response);
  },
  put: function(url, params, response) {
    return apiAxios('PUT', url, params, response);
  },
  delete: function(url, params, response) {
    return apiAxios('DELETE', url, params, response);
  }
};
