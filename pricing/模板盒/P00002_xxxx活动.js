// 安全提示：未来在此文件脚本中需要防注入攻击（技术人员需要关注）
// 录入提示：请确保在此文件中使用英文半角字符进行符号编辑，可参考模板

// 以下公用定义，请不要修改
const { 工具 } = require('../common/工具.js');
const 打印 = console.log;

// 以下是本活动的商品『黑白名单』
var 可参与本活动的商品清单 = [
  'A1KT*',
];

var 不可以参加本活动的商品清单 = [
  'A1KT1808M??',
];

var 定价 = function() {
  this.计算 = function (本单) {
    // 计算逻辑从这里开始
    var 活动条件额 = 4999;
    var 活动可抵额 = 工具.计算本单积分可抵额(本单, 可参与本活动的商品清单, 不可以参加本活动的商品清单);

    工具.计算会员价(本单);
    工具.分摊优惠券额(本单);

    var 整单合计结果 = 工具.合计(本单, 可参与本活动的商品清单, 不可以参加本活动的商品清单);
    if (整单合计结果.可参与活动折后额合计 >= 活动条件额) {
      工具.分摊抵用额(本单, 可参与本活动的商品清单, 不可以参加本活动的商品清单, 活动可抵额);
    }  
    
    工具.积分计算(本单);
    // 计算逻辑到这里结束
  };
  return this;
}

exports = module.exports = 定价;


