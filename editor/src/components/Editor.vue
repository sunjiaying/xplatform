<template>
  <div class="hello">
    <div class="toolbar">
      <RadioGroup v-model="current" @on-change="changecode">
        <Radio label="P00001_xxxx活动"></Radio>
        <Radio label="P00003_xxxx活动"></Radio>
      </RadioGroup>
      <Button type="success" size="small" @click="save">保存并激活</Button>
      <Button type="primary" size="small" @click="test">测试</Button>

      <Select v-model="templateSelected" size="small" style="width:200px">
        <Option-group label="热门活动">
          <Option v-for="item in templates" :value="item.value" v-bind:key="'3'+item.value">{{ item.label }}</Option>
        </Option-group>
        <Option-group label="个性活动">
          <Option v-for="item in templates" :value="item.value" v-bind:key="'3'+item.value" disabled>{{ item.label }}</Option>
        </Option-group>
      </Select>

      <Button type="primary" size="small" @click="reference" shape="circle" icon="md-color-wand">引用模板</Button>

      <Tag v-if="!editSaved" color="red" style="height: 20px;">正在编辑...</Tag>
    </div>
    <MonacoEditor class="editor" :options="options" v-model="code" language="javascript" @change="changed" @editorWillMount="editorWillMount" />
    <div class="billtable">
      <CheckboxGroup v-model="pricing" @on-change="test">
        <Checkbox label="基本定价" disabled></Checkbox>
        <Checkbox label="P00001_xxxx活动"></Checkbox>
        <Checkbox label="P00003_xxxx活动"></Checkbox>
      </CheckboxGroup>
      <table class="t1" border="1" cellspacing="0" cellpadding="0">
        <tbody>
          <tr>
            <th>款号</th>
            <th>数量</th>
            <th>吊牌价</th>
            <th>一口价</th>
            <th>操作</th>
          </tr>
          <tr v-for="item in bills[0].商品清单" :key="item.款号">
            <td><input style="width:90px;" type="text" v-model="item.款号" @change="test"></td>
            <td><input type="text" v-model="item.数量" @change="test"></td>
            <td><input type="text" v-model="item.吊牌价" @change="test"></td>
            <td><input type="text" v-model="item.一口价" @change="test"></td>
            <td>              
              <Button-group size="small" shape="circle">
                <Button type="error" @click="remove(item)">移除</Button>
                <Button type="primary" @click="add(item)">添加</Button>
              </Button-group>
            </td>
          </tr>
        </tbody>
      </table>
      <table class="t1" border="1" cellspacing="0" cellpadding="0">
        <tbody>
          <tr>
            <th>面值</th>
            <th>开始时间</th>
            <th>截止时间</th>
            <th>结算方式</th>
            <th>使用范围</th>
            <th>使用</th>
          </tr>
          <tr v-for="item in bills[0].优惠券" :key="item.款号">
            <td>{{item.面值}}</td>
            <td>{{item.开始时间}}</td>
            <td>{{item.截止时间}}</td>
            <td>{{item.结算方式}}</td>
            <td>{{item.使用范围}}</td>
            <td><Checkbox v-model="item.使用" @on-change="test">使用</Checkbox></td>
          </tr>
        </tbody>
      </table>
      <Button style="margin-top:10px;" type="primary" size="small" @click="test">测试</Button>
      <table class="t2" border="1" cellspacing="0" cellpadding="0">
        <tbody>
          <tr>
            <th>款号</th>
            <th>数量</th>
            <th>吊牌价</th>
            <th>优惠券1</th>
            <th>一口价</th>
            <th>会员价</th>
            <th>基折额</th>
            <th>活折额1</th>
            <th>返现额</th>
            <th>活折额2</th>
            <th>业务额</th>
            <th>积分额</th>
            <th>优惠券2</th>
            <th>结算额</th>
          </tr>
          <tr v-for="item in bill.商品清单" :key="item.款号">
            <td>{{item.款号}}</td>
            <td>{{item.数量}}</td>
            <td>{{item.吊牌价}}</td>
            <td>{{item.优惠券1}}</td>
            <td>{{item.一口价}}</td>
            <td>{{item.会员价}}</td>
            <td>{{item.基折额}}</td>
            <td>{{item.活折额1}}</td>
            <td>{{item.返现额}}</td>
            <td>{{item.活折额2}}</td>
            <td style="background-color: #ddd;">{{item.业务额}}</td>
            <td>{{item.积分额}}</td>
            <td>{{item.优惠券2}}</td>
            <td style="background-color: #ddd;">{{item.结算额}}</td>
          </tr>
        </tbody>
      </table>
      <table class="t1" border="1" cellspacing="0" cellpadding="0">
        <tbody>
          <tr>
            <th>项目</th>
            <th>金额</th>
            <th>折扣</th>
          </tr>
          <tr v-for="item in bill.折扣测算" :key="item.项目">
            <td>{{item.项目}}</td>
            <td>{{item.金额}}</td>
            <td>{{item.折扣}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <Modal @on-ok="template" v-model="template_input" :mask-closable="false" title="您确认要引用此模板吗">
      <div v-for="item in template_inputs" :key="item.参数名称">
        {{item.参数名称}}
        <Input v-if="item.值类型==='单值'" v-model="item.值" :placeholder="item.参数名称" />
      </div>
    </Modal>
  </div>
</template>

<script>
import MonacoEditor from "vue-monaco";
export default {
  components: {
    MonacoEditor
  },
  name: "Editor",
  data() {
    return {
      current: 'P00001_xxxx活动',
      pricing: ['基本定价'],
      options: {
        tabSize: 2,
        lineNumbers: true
      },
      monaco: null,
      template_inputs: [],
      template_input: false,
      code: "",
      editSaved: false, 
      templateSelected: '',
      templates: [
        { "label": "满xxxx减xxx", "value": "P00001_xxxx活动" },
        { "label": "满xxxx积分抵xxx", "value": "P00002_xxxx活动" },
        { "label": "满xxxx最低商品免单", "value": "P00003_xxxx活动" },
        { "label": "满xxxx给xx折扣", "value": "P00004_xxxx活动" },
      ],
      bills: [
      {
        "商品清单": [
          {
            "店号": "SZ09",
            "品牌": "MA",
            "折扣": 9,
            "仓位": "0001",
            "款号": "A1KT1805M04",
            "名称": "针织上衣, 36",
            "数量": 2,
            "积分": 147,
            "吊牌价": 3980,
            "一口价": 3980
          },
          {
            "店号": "SZ09",
            "品牌": "MA",
            "折扣": 9,
            "仓位": "0001",
            "款号": "A1KT1806M04",
            "名称": "针织上衣, 36",
            "数量": 1,
            "积分": 147,
            "吊牌价": 70,
            "一口价": 70
          },
          {
            "店号": "SZ09",
            "品牌": "MA",
            "折扣": 9,
            "仓位": "0001",
            "款号": "A1KT1807M04",
            "名称": "针织上衣, 36",
            "数量": 1,
            "积分": 147,
            "吊牌价": 3980,
            "一口价": 2280
          },
          {
            "店号": "SZ09",
            "品牌": "MA",
            "折扣": 9,
            "仓位": "0001",
            "款号": "A1KT1808M04",
            "名称": "针织上衣, 36",
            "数量": 1,
            "积分": 147,
            "吊牌价": 3980,
            "一口价": 3980
          },
        ],
        "VIP顾客": {
          "ID": 123456789,
          "手机": "13418497179",
          "姓名": "刘文武",
          "生日": "1989-12-01",
          "积分": 256
        },
        "优惠券": [
          {
            "券号": "SROKSODKXLST",
            "面值": 80,
            "本单用额": 0,
            "开始时间": "2019-11-20",
            "截止时间": "2019-12-31",
            "结算方式": "先券后折",
            "使用范围": ["A1KT1806M*"],
            "名称": "2019年11月生日券",
            "规则": "1.仅限购买当季商品 2.此券不退不换 3.......",
            "使用": true
          },
          {
            "券号": "SROKSODKXLST",
            "面值": 90,
            "本单用额": 0,
            "开始时间": "2019-11-20",
            "截止时间": "2019-12-31",
            "结算方式": "先折后券",
            "使用范围": ["A1KT1807M*"],
            "名称": "2019年11月生日券",
            "规则": "1.仅限购买当季商品 2.此券不退不换 3.......",
            "使用": true
          }
        ]
      }
    ],
    bill: {}
    };
  },
  mounted() {
    this.autocompletion();
    this.reload();  
  },
  methods: {
    autocompletion() {
      this.$api.get('autocompletion', null, response => {
        if (response.data && response.status && (response.status >= 200 && response.status < 300)) {
          if (response.data === 'error') {
            return;
          }
          this.suggestions = response.data;
          import('monaco-themes/themes/idleFingers.json')
          .then(data => {
            this.monaco.editor.defineTheme('monokai', data);
            this.monaco.editor.setTheme('monokai');
          });          
          this.monaco.languages.registerCompletionItemProvider('javascript', {
            provideCompletionItems: function(model, position) {
              var textUntilPosition = model.getValueInRange({startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column});
              var match = textUntilPosition.match(/(\S+)$/);
              var sug = [];
              response.data.forEach(item => {
                if (item.kind === 'Function') {
                  sug.push({
                    label: item.label,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: item.documentation,
                    insertText: item.insertText
                  });
                } else if (item.kind === 'Snippet') {
                  sug.push({
                    label: item.label,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: item.documentation,
                    insertText: item.insertText.join('\n')
                  });
                }
              });             
              return {
                suggestions: sug
              };
            }
          });
        }
      });
    },
    changed() {
      this.editSaved = false;
    },
    changecode() {
      this.reload();
    },
    template() {
      this.$api.get('template', { "value": this.templateSelected }, response => {
        if (response.data && response.status && (response.status >= 200 && response.status < 300)) {
          var c = response.data;
          if (this.template_inputs.length > 0) {        
            this.template_inputs.forEach(item => {
              var reg = new RegExp(`'##${item.参数名称}##'`, "gmi");
              c = c.replace(reg, `${item.值}`);
            });
          }
          this.code = c;
          this.editSaved = true;
          this.$Message.success('引用模板操作成功.');
        }
      });
    },
    reference() {        
      this.$api.get('template_input', { value: this.templateSelected }, response => {
        if (response.data && response.status && (response.status >= 200 && response.status < 300)) {
          if (response.data === 'error'){
            this.template_inputs = [];            
          } else {
            this.template_inputs = response.data;
          }
          this.template_input = true;
        } else {
          this.template_inputs = [];
        }
      });      
    },
    reload() {
      this.$api.get('promotion', { value: this.current }, response => {
        if (response.data && response.status && (response.status >= 200 && response.status < 300)) {
          this.code = response.data;
          this.editSaved = true;
        }
      });
    },
    save() {
      this.$api.post('save', { value: this.current, code: this.code }, response => {
        if (response.status >= 200 && response.status < 300) {
          if(response.data === 'ok') {      
            this.editSaved = true;    
            this.$Message.success('保存成功');
            this.reload();
            this.test();
          } else if(response.data === 'error_injection') {
            this.$Message.error('保存失败！危险操作，存在禁止使用的语句');
          }
        }
      });
    },
    test() {
      this.$api.post('calc', {pricing: this.pricing, bill: this.bills[0]}, response => {
        if (response.status >= 200 && response.status < 300) {
          this.bill = response.data;
        }
      });      
    },
    remove(item) {
      var index_delete = -1;
      for (let index = 0; index < this.bills[0].商品清单.length; index++) {
        const element = this.bills[0].商品清单[index];
        if (element.款号 === item.款号) {
          index_delete = index;
        }
      }
      this.bills[0].商品清单.splice(index_delete, 1);
      this.test();
    },
    add(item) {
      var index_add = -1;
      for (let index = 0; index < this.bills[0].商品清单.length; index++) {
        const element = this.bills[0].商品清单[index];
        if (element.款号 === item.款号) {
          index_add = index;
        }
      }
      this.bills[0].商品清单.splice(index_add + 1, 0,
      {
        "店号": "SZ09",
        "品牌": "MA",
        "折扣": 9,
        "仓位": "0001",
        "款号": "A1000000004",
        "名称": "针织上衣, 36",
        "数量": 1,
        "积分": 147,
        "吊牌价": 999,
        "一口价": 999
      });
      this.test();
    },
    editorDidMount(editor) {
      // Listen to `scroll` event
      editor.onDidScrollChange(e => {
        console.log(e)
      })
    },
    editorWillMount(monaco) {
      this.monaco = monaco;      
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.toolbar {
  padding: 5px;
  margin: 0px;
}
.toolbar .btn {
  width: 60px;
  /* height: 30px;
  border: 1px solid #aaa; */
}
.editor {
  float: left;
  width: 800px;
  height: 800px;
}
.billtable {
  float: right;
  top: 0px;
  left: 820px;
  width: calc(100% - 830px);
  height: 600px;
  font-size: 9pt;
}
.billtable .t1 {
  border: 1px solid #aaa;
  border-collapse: collapse;
  margin-top: 10px;
}
.billtable .t1 tr td,th {
  padding: 3px;
}
.billtable .t1 tr td {
  text-align: right;
}
.billtable .t1 tr td input[type="text"] {
  width: 30px;
  text-align: center;
}
.billtable .t2 {
  border: 1px solid #aaa;
  border-collapse: collapse;
  margin-top: 10px;
}
.billtable .t2 tr td,th {
  padding: 3px;
}
.billtable .t2 tr td {
  text-align: right;
}
.green {
  background-color: green;
}
</style>
