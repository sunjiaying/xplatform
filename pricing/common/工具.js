const micromatch = require('micromatch');
const moment = require('moment');

var 工具 = {};
var 打印 = console.log;

const { 通用 } = require('./通用.js');
工具.匹配 = 通用.匹配;
工具.合计 = 通用.合计;
工具.打印计算过程 = 通用.打印计算过程;


const { 会员 } = require('./会员.js');
工具.积分计算 = 会员.积分计算;
工具.计算会员价 = 会员.计算会员价;
工具.计算本单积分可抵额 = 会员.计算本单积分可抵额;


const { 优惠券 } = require('./优惠券.js');
工具.分摊优惠券额 = 优惠券.分摊优惠券额;


const { 活动 } = require('./活动.js');
工具.分摊抵用额 = 活动.分摊抵用额;
工具.活动折扣 = 活动.活动折扣;
工具.基折价最低商品免单 = 活动.基折价最低商品免单;

module.exports = {
  工具
}