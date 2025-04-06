<template>
	<view>
	  <view class="search-box">
	    <!-- 使用 uni-ui 提供的搜索组件 -->
	    <uni-search-bar @input="input" @clear="getHistoryList" v-model="kw" :radius="100" cancelButton="none"  placeholder="请输入搜索内容"></uni-search-bar>
	  </view>
	  
	  <!-- 搜索建议列表 搜索长度不为0时显示-->
	  <view class="sugg-list" v-if="searchResults.length !== 0">
	    <view class="sugg-item" v-for="(item, i) in searchResults" :key="i" @click="gotoDetail(item.id)">
	      <view class="goods-name">{{item.name}}</view>
	      <uni-icons type="arrowright" size="16"></uni-icons>
	    </view>
	  </view>
	  
	  <!-- 搜索历史 搜索长度为0时显示-->
	  <view class="history-box" v-else>
	    <!-- 标题区域 -->
	    <view class="history-title">
	      <text>搜索历史</text>
	      <uni-icons type="trash" size="17" @click="cleanHistory"></uni-icons>
	    </view>
	    <!-- 列表区域 -->
	    <view class="history-list">
	      <uni-tag :text="item.keyword" v-for="(item, i) in historyList" :key="i" @click="gotoGoodsList(item)"></uni-tag>
	    </view>
	  </view>
	</view>
</template>
<script>
	import { mapState } from 'vuex';
	import { searchProductList } from '@/api/product.js';
	import { createSearchHistory, fetchSearchHistoryList, clearHistory, delSearchHistory } from '@/api/memberSearchHistory.js';
	export default {
		data() {
			return {
			  // 延时器的 timerId
			  timer: null,
			  // 搜索关键词
			  kw: '',
			  // 搜索结果列表
			  searchResults: [],
		      // 搜索关键词的历史记录(假数据)
		      historyList: []
			};
		},
		methods: {
		  //input 事件处理函数
		  input(e) {
		    // 清除 timer 对应的延时器
		    clearTimeout(this.timer)
		    // 重新启动一个延时器，并把 timerId 赋值给 this.timer
		    this.timer = setTimeout(() => {
		      // 如果 500 毫秒内，没有触发新的输入事件，则为搜索关键词赋值
		      this.kw = e;
			  this.getSearchList();
		    }, 500)
		  },
		  
		  async getSearchList() {
		    // 判断关键词是否为空
		    if (this.kw === '' || this.kw === undefined) {
		      this.searchResults = []
		      return;
		    }
		    // 发起请求，获取搜索建议列表
			searchProductList({ "keyword": this.kw }).then(res => {
				this.searchResults = res.data.list;
			});
			// 1. 查询到搜索建议之后，调用 saveSearchHistory() 方法保存搜索关键词
			this.saveSearchHistory()
			this.getHistoryList();
		  },
		  
		  gotoDetail(id) {
		    uni.navigateTo({
		      // 指定详情页面的 URL 地址，并传递 goods_id 参数
		      url: `/pages/product/product?id=${id}`
		    })
		  },
		  
		  // 2. 保存搜索关键词的方法
		  // 保存搜索关键词为历史记录
		  saveSearchHistory() {
			if (this.kw === undefined || this.kw === '') {
				return;
			}
		    if (this.hasLogin) {
		      let data = {
		        keyword: this.kw
		      }
			  // 先删
			  delSearchHistory(data).then(() => {
				  // 再存
				  createSearchHistory(data);
			  });
		    }
		  },
		  
		  // 清空搜索历史记录
		  cleanHistory() {
			  clearHistory();
			  this.getHistoryList();
		  },
		  
		  // 点击跳转到商品列表页面
		  gotoGoodsList(kw) {
			this.kw = kw.keyword;
			// 清除 timer 对应的延时器
			clearTimeout(this.timer)
			// 重新启动一个延时器，并把 timerId 赋值给 this.timer
			this.timer = setTimeout(() => {
			  // 如果 500 毫秒内，没有触发新的输入事件，则为搜索关键词赋值
			  this.kw = kw.keyword;
			  this.getSearchList();
			}, 500)
		  },
		  getHistoryList() {
			  fetchSearchHistoryList().then(respone => {
				  this.historyList = respone.data;
			  })
		  }
		},
		computed: {
			...mapState(['hasLogin'])
		},
		//加载本地存储的搜索历史记录
		onLoad() {
		  this.getHistoryList();
		}
	}
</script>
<style lang="scss">
.search-box {
  // 设置定位效果为“吸顶”
  position: sticky;
  // 吸顶的“位置”
  top: 0;
  // 提高层级，防止被轮播图覆盖
  z-index: 999;
}

.sugg-list {
  padding: 0 5px;

  .sugg-item {
    font-size: 12px;
    padding: 13px 0;
    border-bottom: 1px solid #efefef;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .goods-name {
      // 文字不允许换行（单行文本）
      white-space: nowrap;
      // 溢出部分隐藏
      overflow: hidden;
      // 文本溢出后，使用 ... 代替
      text-overflow: ellipsis;
      margin-right: 3px;
    }
  }
}

.history-box {
  padding: 0 5px;

  .history-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    font-size: 13px;
    border-bottom: 1px solid #efefef;
  }

  .history-list {
    display: flex;
    flex-wrap: wrap;

    .uni-tag {
      margin-top: 5px;
      margin-right: 5px;
    }
  }
}
</style>

