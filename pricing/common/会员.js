const micromatch = require('micromatch');
const moment = require('moment');

const { 通用 } = require('./通用.js');

var 打印 = console.log;

var 正价会员折扣规则 = [
  // MA会员折扣
  {
    '款号规则': ['A1*', 'A2*'],
    '会员级别': ['*'],
    '折扣': 0.9,
  },
  // SU会员折扣
  {
    '款号规则': ['B1*', 'B2*'],
    '会员级别': ['*'],
    '折扣': 0.85,
  },
  // AUM会员折扣
  {
    '款号规则': ['M1*', 'M2*'],
    '会员级别': ['*'],
    '折扣': 0.9,
  },
  // ZCY会员折扣
  {
    '款号规则': ['C1*', 'C2*'],
    '会员级别': ['*'],
    '折扣': 0.9,
  },
  // MDC会员折扣
  {
    '款号规则': ['E1*', 'E2*'],
    '会员级别': ['*'],
    '折扣': 0.9,
  },
  // MJUT会员折扣
  {
    '款号规则': ['D1*', 'D2*'],
    '会员级别': ['*'],
    '折扣': 0.9,
  },
  // RUI会员折扣
  {
    '款号规则': ['Y1*', 'Y2*'],
    '会员级别': ['*'],
    '折扣': 0.9,
  }
]

var 会员 = function() {
  this.计算本单积分可抵额 = function (本单, 可参与本活动的商品清单, 不可以参加本活动的商品清单) {
    return 0;
  };

  this.按商品计算积分 = function(item, 积分倍率, 结算积分汇率) {
    item.积分 = item.结算额 / 结算积分汇率 * 积分倍率;
  }

  this.积分计算 = function (本单) {
    if (!本单.VIP顾客)
      return;

    // todo 可以按品牌扩展积分
    var 积分倍率 = 1;
    if (本单.VIP顾客.生日) {
      if (moment(本单.VIP顾客.生日).format('MM') == moment().format('MM')) {
        积分倍率 = 2;
      }
    }
    
    var 整单积分 = 0;
    var 结算积分汇率 = 20;
    本单.商品清单.forEach(item => {
      // todo 在此可以增强按商品或者仓位来控制积分
      按商品计算积分(item, 积分倍率, 结算积分汇率);
      整单积分 += item.积分;
    });
    本单.整单积分 = parseFloat(整单积分.toFixed(0));
    // 打印(`该顾客本单可积${本单.整单积分}分`);
    // 打印(`该顾客本单获取0元赠券`);
  };

  this.按商品计算会员价 = function(item) {
    item.会员价 = item.吊牌价;

    for (let index = 0; index < 正价会员折扣规则.length; index++) {
      const 规则 = 正价会员折扣规则[index];
      if (通用.匹配(item.款号, 规则.款号规则)) {
        item.会员价 = item.吊牌价 * 规则.折扣;
        break;
      }
    }
  }

  this.计算会员价 = function (本单) {  
    本单.商品清单.forEach(item => {
      item.会员价 = item.吊牌价;
      if (本单.VIP顾客) {
        // todo 扩展
        按商品计算会员价(item);
      }
      if (item.一口价 != item.吊牌价) {
        item.会员价 = item.一口价;
      }
      item.积分额 = 0;
      item.返现额前折 = 1;
      item.返现额后折 = 1;
      item.返现额 = 0;
      item.优惠券1 = 0;
      item.优惠券2 = 0;
      item.基折额 = parseFloat((item.会员价 * item.数量).toFixed(2));
      item.活折额1 = parseFloat((item.基折额 * item.返现额前折).toFixed(2));
      item.活折额2 = parseFloat((item.活折额1 - item.返现额).toFixed(2));
      item.活折额2 = item.活折额2 < 0 ? 0 : item.活折额2;
      item.业务额 = parseFloat((item.活折额2 * item.返现额后折).toFixed(2));
      item.业务额 = item.业务额 < 0 ? 0 : item.业务额;
      item.结算额 = item.业务额 - item.积分额 - item.优惠券2;
      item.结算额 = item.结算额 < 0 ? 0 : item.结算额;
    });
  };

  return this;
}

exports = module.exports = 会员;