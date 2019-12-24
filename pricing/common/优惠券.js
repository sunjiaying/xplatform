const micromatch = require('micromatch');
const moment = require('moment');

const { 通用 } = require('./通用.js');

var 打印 = console.log;

var 优惠券 = function() {
  this.分摊优惠券额 = function (本单, 可参与本活动的商品清单, 不可以参加本活动的商品清单) {
    if (!本单.优惠券 || 本单.优惠券.length<1)
      return;
    
    本单.优惠券.forEach(coupon => {
      if (coupon.使用) {
        分摊一张优惠券额(本单, 可参与本活动的商品清单, 不可以参加本活动的商品清单, coupon);
      }
    });
  };

  this.分摊一张优惠券额 = function (本单, 可参与本活动的商品清单, 不可以参加本活动的商品清单, 优惠券) {
    // 思路：
    // 1、先循环一次统计可参与活动的商品清单会员价合计
    // 2、然后再循环一次按比例计算分摊额
    var 可参使用券的商品清单会员价合计 = 0;
    var 可参使用券的商品清单吊牌价合计 = 0;
    var 项目行数 = 0;  
    本单.商品清单.forEach(item => {
      if (
        通用.匹配(item.款号, 优惠券.使用范围)
      ) {
        可参使用券的商品清单会员价合计 += item.会员价 * item.数量;
        可参使用券的商品清单吊牌价合计 += item.吊牌价 * item.数量;
        项目行数++;
      }
    });
    var 可抵用额 = 优惠券.面值;
    // todo 如果需要控制券额使用条件可以在此增强
    var 券额可用比例 = 0.5;
    if (优惠券.结算方式 === '先券后折') {
      可抵用额 = 优惠券.面值 > 可参使用券的商品清单会员价合计 * 券额可用比例 ? 可参使用券的商品清单会员价合计 * 券额可用比例 : 优惠券.面值;
    } if (优惠券.结算方式 === '先折后券') {
      可抵用额 = 优惠券.面值 > 可参使用券的商品清单会员价合计 * 券额可用比例 ? 可参使用券的商品清单会员价合计 * 券额可用比例 : 优惠券.面值;
    }
    优惠券.本单用额 = 可抵用额;
    var 已分摊额 = 0;
    var 项目行计数 = 0;
    本单.商品清单.forEach(item => {
      if (
        通用.匹配(item.款号, 优惠券.使用范围)
      ) {
        项目行计数++;
        if (项目行计数 === 项目行数) {
          if (优惠券.结算方式 === '先券后折') {
            item.优惠券1 = 可抵用额 - 已分摊额;
          } if (优惠券.结算方式 === '先折后券') {
            item.优惠券2 = 可抵用额 - 已分摊额;
          }
        } else {
          if (优惠券.结算方式 === '先券后折') {
            item.优惠券1 = Math.round((item.会员价 * item.数量) / 可参使用券的商品清单会员价合计 * 可抵用额);
          } if (优惠券.结算方式 === '先折后券') {
            item.优惠券2 = Math.round((item.会员价 * item.数量) / 可参使用券的商品清单会员价合计 * 可抵用额);
          }
        }
        if (优惠券.结算方式 === '先券后折') {
          已分摊额 += item.优惠券1;
        } if (优惠券.结算方式 === '先折后券') {
          已分摊额 += item.优惠券2;
        }            
      }

      // 折扣是为了还原会员折和一口价特卖折
      var 折扣 = item.会员价 / item.吊牌价;
      // 在此先抵掉优惠券1额
      var 折前额 = item.吊牌价 * item.数量 - item.优惠券1;    
      折前额 = 折前额 >= 0 ? 折前额 : 0;
      item.基折额 = parseFloat((折前额 * 折扣).toFixed(2));

      // 什么时候用会员价来计算基折额    
      if (item.优惠券1 > 0) {
        item.基折额 = parseFloat((item.会员价 * item.数量 - item.优惠券1).toFixed(2));
      }
      item.活折额1 = parseFloat((item.基折额 * item.返现额前折).toFixed(2));
      item.活折额2 = parseFloat((item.活折额1 - item.返现额).toFixed(2));
      item.活折额2 = item.活折额2 < 0 ? 0 : item.活折额2;
      item.业务额 = parseFloat((item.活折额2 * item.返现额后折).toFixed(2));
      item.业务额 = item.业务额 < 0 ? 0 : item.业务额;
    });
  };
  return this;
}

exports = module.exports = 优惠券;