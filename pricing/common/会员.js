const micromatch = require('micromatch');
const moment = require('moment');

const { 通用 } = require('./通用.js');

var 会员 = {};
var 打印 = console.log;

会员.计算本单积分可抵额 = function (本单, 可参与本活动的商品清单, 不可以参加本活动的商品清单) {
  return 0;
};

会员.积分计算 = function (本单) {
  if (!本单.VIP顾客)
    return;

  // todo 可以扩展
  var 积分倍率 = 1;
  if (本单.VIP顾客.生日) {
    if (moment(本单.VIP顾客.生日).format('MM') == moment().format('MM')) {
      积分倍率 = 2;
      打印(`
该顾客由于在生日月消费,拥有${积分倍率}倍积分`);
    }
  }
  
  var 整单积分 = 0;
  var 结算积分汇率 = 20;
  本单.商品清单.forEach(item => {
    // todo 在此可以增强按商品或者仓位来控制积分
    item.积分 = item.结算额 / 结算积分汇率 * 积分倍率;
    整单积分 += item.积分;
  });
  本单.整单积分 = 整单积分.toFixed(0);
  打印(`该顾客本单可积${本单.整单积分}分`);
  打印(`该顾客本单获取0元赠券`);
};

会员.计算会员价 = function (本单) {  
  本单.商品清单.forEach(item => {
    item.会员价 = item.吊牌价;
    if (本单.VIP顾客) {
      item.会员价 = item.吊牌价 * 0.9;
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
    item.活折额1 = (item.基折额 * item.返现额前折).toFixed(2);
    item.活折额2 = (item.活折额1 - item.返现额).toFixed(2);
    item.业务额 = (item.活折额2 * item.返现额后折).toFixed(2);
    item.结算额 = item.业务额 - item.积分额 - item.优惠券2;
  });
};

module.exports = {
  会员
}
