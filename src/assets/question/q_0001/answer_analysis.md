```javascript
function sayhello() {
  console.log("hello world!");
}
```

- beforeCreate：实例刚初始化，data、methods 均不可用。
- created：实例创建完成，可访问/修改数据，但 DOM 未生成；适合发异步请求。
- beforeMount：模板已编译为 render 函数，即将首次渲染真实 DOM。
- mounted：真实 DOM 已插入页面，可安全操作 $refs；适合初始化第三方库。
- beforeUpdate：响应式数据变化后、虚拟 DOM 重新渲染之前触发，可再次改数据。
- updated：虚拟 DOM 重新渲染并打补丁完成；此阶段改数据易引发循环更新。
- beforeDestroy：实例销毁前，可清理定时器、解绑全局事件。
- destroyed：实例已销毁，只剩空 DOM；所有绑定、监听、子实例均被移除。

```javascript
function sayhello() {
  console.log("hello");
}
```