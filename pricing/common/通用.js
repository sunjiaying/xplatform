const micromatch = require('micromatch');
const moment = require('moment');

var 通用 = {};
var 打印 = console.log;

通用.匹配 = function (款号, 清单) {
  return micromatch.isMatch(款号, 清单);
};

通用.合计 = function (本单, 可参与本活动的商品清单, 不可以参加本活动的商品清单) {
  var sum = {};

  sum.件数 = 0;
  sum.吊牌价合计 = 0;
  sum.会员价合计 = 0;
  sum.基折额合计 = 0;
  sum.结算额合计 = 0;

  sum.可参与活动件数 = 0;
  sum.可参与活动吊牌价合计 = 0;
  sum.可参与活动会员价合计 = 0;
  sum.可参与活动基折额合计 = 0;
  sum.可参与活动结算额合计 = 0;


  本单.商品清单.forEach(item => {
    sum.件数 += item.数量;
    sum.吊牌价合计 += item.吊牌价 * item.数量;
    sum.会员价合计 += item.会员价 * item.数量;
    sum.基折额合计 += item.基折额;
    sum.结算额合计 += item.结算额;

    if (
      通用.匹配(item.款号, 可参与本活动的商品清单)
      && !通用.匹配(item.款号, 不可以参加本活动的商品清单)
    ) {
      sum.可参与活动件数 += item.数量;
      sum.可参与活动吊牌价合计 += item.吊牌价 * item.数量;
      sum.可参与活动会员价合计 += item.会员价 * item.数量;
      sum.可参与活动基折额合计 += item.基折额;
      sum.可参与活动结算额合计 += item.结算额;
    }
  });
  sum.结算额合计 = Math.round(sum.结算额合计);
  return sum;
};

通用.折扣测算 = function (本单) {
  var 本单吊牌额 = 0;
  var 本单基折额 = 0;
  var 本单业务额 = 0;
  var 本单结算额 = 0;  
  本单.商品清单.forEach(item => {    
    本单吊牌额 += item.数量 * item.吊牌价;
    本单基折额 += item.基折额;
    本单业务额 += item.业务额;
    本单结算额 += item.结算额;
  });
  本单.折扣测算 = [];
  本单.折扣测算.push({ "项目": "本单吊牌额", "金额": parseFloat(本单吊牌额.toFixed(2)), "折扣": parseFloat((本单吊牌额 / 本单吊牌额 * 10).toFixed(2)) });
  本单.折扣测算.push({ "项目": "本单基折额", "金额": parseFloat(本单基折额.toFixed(2)), "折扣": parseFloat((本单基折额 / 本单吊牌额 * 10).toFixed(2)) });
  本单.折扣测算.push({ "项目": "本单业务额", "金额": parseFloat(本单业务额.toFixed(2)), "折扣": parseFloat((本单业务额 / 本单吊牌额 * 10).toFixed(2)) });
  本单.折扣测算.push({ "项目": "本单结算额", "金额": parseFloat(本单结算额.toFixed(2)), "折扣": parseFloat((本单结算额 / 本单吊牌额 * 10).toFixed(2)) });
};

通用.打印计算过程 = function (本单) {
  if (本单.优惠券 && 本单.优惠券.length > 0) {
    打印(`\n顾客优惠券:`);
    打印(`开始时间\t截止时间\t面值\t结算方式\t用额\t使用范围`);
  }
  本单.优惠券.forEach(coupon => {
    打印(`${coupon.开始时间}\t${coupon.截止时间}\t${coupon.面值}\t${coupon.结算方式}\t${coupon.本单用额}\t${coupon.使用范围}`);
  });
  打印(`\n商品款号\t数量\t吊牌价\t优惠券1\t一口价\t会员价\t基折额\t活折额1\t返现额\t活折额2\t业务额\t积分额\t优惠券2\t结算额`);
  var 本单吊牌额 = 0;
  var 本单基折额 = 0;
  var 本单业务额 = 0;
  var 本单结算额 = 0;  
  本单.商品清单.forEach(item => {
    打印(`${item.款号}\t${item.数量}\t${item.吊牌价}\t${item.优惠券1}\t${item.一口价}\t${item.会员价}\t${item.基折额}\t${item.活折额1}\t${item.返现额}\t${item.活折额2}\t${item.业务额}\t${item.积分额}\t${item.优惠券2}\t${item.结算额}`);
    本单吊牌额 += item.数量 * item.吊牌价;
    本单基折额 += item.基折额;
    本单业务额 += item.业务额;
    本单结算额 += item.结算额;
  });
  打印(`
结算额 = 业务额 - 积分额 - 优惠券2
业务额 = 活折额2 * 返现额后折
活折额2 = 活折额1 - 返现额
活折额1 = 基折额 * 返现额前折
正价基折额 = (吊牌价 * 数量 - 优惠券1) * 会员折扣
特卖基折额 = (吊牌价 * 数量 - 优惠券1) * 特卖折扣
注意:
特卖折扣 = 一口价 / 吊牌价
优惠券1 = 先券后折券额
优惠券2 = 先折后券券额`);
  打印(`
本单吊牌额 ${本单吊牌额}\t折扣 ${parseFloat((本单吊牌额 / 本单吊牌额 * 10).toFixed(4)) * 100}
本单基折额 ${本单基折额}\t折扣 ${parseFloat((本单基折额 / 本单吊牌额 * 10).toFixed(4)) * 100}
本单业务额 ${本单业务额}\t折扣 ${parseFloat((本单业务额 / 本单吊牌额 * 10).toFixed(4)) * 100}
本单结算额 ${本单结算额}\t折扣 ${parseFloat((本单结算额 / 本单吊牌额 * 10).toFixed(4)) * 100}`);
  本单.折扣测算 = [];
  本单.折扣测算.push({ "项目": "本单吊牌额", "金额": parseFloat(本单吊牌额.toFixed(2)), "折扣": parseFloat((本单吊牌额 / 本单吊牌额 * 10).toFixed(2)) });
  本单.折扣测算.push({ "项目": "本单基折额", "金额": parseFloat(本单基折额.toFixed(2)), "折扣": parseFloat((本单基折额 / 本单吊牌额 * 10).toFixed(2)) });
  本单.折扣测算.push({ "项目": "本单业务额", "金额": parseFloat(本单业务额.toFixed(2)), "折扣": parseFloat((本单业务额 / 本单吊牌额 * 10).toFixed(2)) });
  本单.折扣测算.push({ "项目": "本单结算额", "金额": parseFloat(本单结算额.toFixed(2)), "折扣": parseFloat((本单结算额 / 本单吊牌额 * 10).toFixed(2)) });
};

module.exports = {
  通用
}
