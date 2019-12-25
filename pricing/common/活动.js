const micromatch = require('micromatch');
const moment = require('moment');

const { 通用 } = require('./通用.js');

var 打印 = console.log;

var 活动 = function() {
  this.基折价最低商品免单 = function (本单, 可参与本活动的商品清单, 不可以参加本活动的商品清单) {
    var 基折价最低商品款号 = '';
    var 基折价最低商品基折价 = 99999999999;
    本单.商品清单.forEach(item => {
      if (
        通用.匹配(item.款号, 可参与本活动的商品清单) && 
        !通用.匹配(item.款号, 不可以参加本活动的商品清单)
      ) {
        if (基折价最低商品基折价 > item.基折额 / item.数量) {
          基折价最低商品款号 = item.款号;
          基折价最低商品基折价 = item.基折额 / item.数量;
        }
      }
    });
    // console.log('基折价最低商品款号', 基折价最低商品款号);
    本单.商品清单.forEach(item => {
      if (
        通用.匹配(item.款号, 可参与本活动的商品清单) && 
        !通用.匹配(item.款号, 不可以参加本活动的商品清单)
      ) {
        if (item.款号 === 基折价最低商品款号) {
          if (item.优惠券1 > 0 || item.优惠券2 > 0) {
            item.返现额 = item.会员价;
          } else {
            item.返现额 = item.基折额 / item.数量;
          }
        }
        item.活折额1 = parseFloat((item.基折额 * item.返现额前折).toFixed(2));
        item.活折额2 = parseFloat((item.活折额1 - item.返现额).toFixed(2));
        item.活折额2 = item.活折额2 < 0 ? 0 : item.活折额2;
        item.业务额 = parseFloat((item.活折额2 * item.返现额后折).toFixed(2));
        item.业务额 = item.业务额 < 0 ? 0 : item.业务额;
        item.结算额 = item.业务额 - item.积分额 - item.优惠券2;
        item.结算额 = item.结算额 < 0 ? 0 : item.结算额;
        console.log('item.结算额', item.结算额);
      }
    });
  };

  this.活动折扣 = function (本单, 可参与本活动的商品清单, 不可以参加本活动的商品清单, 返现额前折, 返现额后折) {
    本单.商品清单.forEach(item => {
      if (
        通用.匹配(item.款号, 可参与本活动的商品清单) && 
        !通用.匹配(item.款号, 不可以参加本活动的商品清单) &&
        item.基折额 > 0
      ) {
        item.返现额前折 = 返现额前折;
        item.返现额后折 = 返现额后折;
        item.活折额1 = parseFloat((item.基折额 * item.返现额前折).toFixed(2));
        item.活折额2 = parseFloat((item.活折额1 - item.返现额).toFixed(2));
        item.活折额2 = item.活折额2 < 0 ? 0 : item.活折额2;
        item.业务额 = parseFloat((item.活折额2 * item.返现额后折).toFixed(2));
        item.业务额 = item.业务额 < 0 ? 0 : item.业务额;
        item.结算额 = item.业务额 - item.积分额 - item.优惠券2;
        item.结算额 = item.结算额 < 0 ? 0 : item.结算额;
      }    
    });
  };

  this.分摊抵用额 = function (本单, 可参与本活动的商品清单, 不可以参加本活动的商品清单, 可抵用额) {
    // 思路：
    // 1、先循环一次统计可参与活动的商品清单会员价合计
    // 2、然后再循环一次按比例计算分摊额  
    var 可参与本活动的商品清单会员价合计 = 0;
    var 项目行数 = 0;
    本单.商品清单.forEach(item => {
      if (
        通用.匹配(item.款号, 可参与本活动的商品清单) && 
        !通用.匹配(item.款号, 不可以参加本活动的商品清单) &&
        item.基折额 > 0
      ) {
        可参与本活动的商品清单会员价合计 += item.会员价 * item.数量;
        项目行数++;
      }
    });

    var 已分摊额 = 0;
    var 项目行计数 = 0;
    本单.商品清单.forEach(item => {
      if (
        通用.匹配(item.款号, 可参与本活动的商品清单) && 
        !通用.匹配(item.款号, 不可以参加本活动的商品清单) &&
        item.基折额 > 0
      ) {      
        项目行计数++;
        if (项目行计数 === 项目行数) {
          item.返现额 = 可抵用额 - 已分摊额;
        } else {
          item.返现额 = Math.round((item.会员价 * item.数量) / 可参与本活动的商品清单会员价合计 * 可抵用额);
        }
        已分摊额 += item.返现额;
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
      item.结算额 = item.业务额 - item.积分额 - item.优惠券2;
      item.结算额 = item.结算额 < 0 ? 0 : item.结算额;
    });
  };
  return this;
}

exports = module.exports = 活动;