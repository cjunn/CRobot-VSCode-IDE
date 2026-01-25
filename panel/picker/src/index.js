import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "normalize.css"
import './index.scss';
import './icon/iconfont.css'
import 'toastr/build/toastr.min.css';
import toastr from 'toastr';
toastr.options = {
  positionClass: 'toast-bottom-left', // 通知位置
  timeOut: '3000', // 自动关闭时间
};
window.onerror = function (message, source, lineno, colno, error) {
  let errMsg = error.message||error;
  toastr.error(errMsg);
  console.error(errMsg);
  debugger;
};
window.addEventListener('unhandledrejection', function (event) {
  let errMsg = event.reason.message||event.reason;
  toastr.error(errMsg);
  console.error(errMsg);
  debugger;
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
