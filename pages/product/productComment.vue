<template>
	<view class="content">
		<view class="goods-list" @click.stop="closeInput">
			<view class="eva-box" v-if="totalComment > 0" v-for="(item, index) in commentList" :key="index">
				<image class="portrait" :src="item.memberIcon ? item.memberIcon : '../../static/tab-my.png'" mode="aspectFill"></image>
				<view class="right">
					<text class="name">{{item.memberNickName}}</text>
					<text class="con">{{item.content}}</text>
					<view class="bot">
						<text class="time">{{item.createTime}}</text>
						<view class="p-b-btn" @click="toFavorite(item)">
						  <uni-icons type="hand-up" :color = "item.upSelf === 1 ? 'red' : ''" size="20"></uni-icons>
						</view>
						<text class="time">{{item.readCount}}</text>
					</view>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
		<view class="bottom-comment" v-show="!isShow">
		  <!-- 左边静态输入框 -->
		  <view class="disableinput" @click.stop="showInput()">
		    良言一句三冬暖，恶语伤人六月寒。
		  </view>
		  <!-- 文章总评论 -->
		  <view class="bottom-item">
		    <uni-icons type="chat" size="30"></uni-icons>
		    <text class="item-text">{{ totalComment }}</text>
		  </view>
		</view>
		<view class="bottom-comment-send" v-show="isShow">
			<uni-easyinput type="textarea" v-model="content" placeholder=""></uni-easyinput>
			<!-- 发布 -->
			<view class="relase" @click.stop="commentCommit" hover-class="button-hover" :hover-stay-time="100">发布</view>
		</view>
	</view>
</template>

<script>
	import { createComment, replayComment, fetchCommentList, delComment, upOrCancel } from '@/api/memberComment.js';
	import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
	import { mapState } from 'vuex';
	export default {
		components: {
			uniLoadMore
		},
		data() {
			return {
				loadingType: 'more', //加载更多状态
				commentList: [],
				totalComment: 0,
				content: '',
				isShow: false,
				searchParam: {
					pageNum: 1,
					pageSize: 6,
					productId: 0,
					sort: 0
				},
			};
		},

		onLoad(options) {
			this.searchParam.productId = options.id;
			this.loadData();
		},
		//下拉刷新
		onPullDownRefresh() {
			this.loadData('refresh');
		},
		//加载更多
		onReachBottom() {
			this.searchParam.pageNum++;
			this.loadData();
		},
		computed: {
		  ...mapState(['hasLogin'])
		},
		methods: {
			//加载商品 ，带下拉刷新和上滑加载
			async loadData(type = 'add', loading) {
				//没有更多直接返回
				if (type === 'add') {
					if (this.loadingType === 'nomore') {
						return;
					}
					this.loadingType = 'loading';
				} else {
					this.loadingType = 'more'
				}

				if (type === 'refresh') {
					this.searchParam.pageNum=1;
					this.commentList = [];
				}
				fetchCommentList(this.searchParam).then(response => {
					let commentList = response.data.list;
					this.totalComment = response.data.total;
					if (response.data.list.length === 0) {
						//没有更多了
						this.loadingType = 'nomore';
						this.searchParam.pageNum--;
					} else {
						if (response.data.list.length < this.searchParam.pageSize) {
							this.loadingType = 'nomore';
							this.searchParam.pageNum--;
						} else {
							this.loadingType = 'more';
						}
						this.commentList = this.commentList.concat(commentList);
					}
					if (type === 'refresh') {
						if (loading == 1) {
							uni.hideLoading()
						} else {
							uni.stopPullDownRefresh();
						}
					}
				});
			},
			//检查登录状态并弹出登录框
			checkForLogin() {
			  if (!this.hasLogin) {
			    uni.showModal({
			      title: '提示',
			      content: '你还没登录，是否要登录？',
			      confirmText: '去登录',
			      cancelText: '取消',
			      success: function (res) {
			        if (res.confirm) {
			          uni.navigateTo({
			            url: '/pages/public/login'
			          })
			        } else if (res.cancel) {
			          console.log('用户点击取消');
			        }
			      }
			    });
			    return false;
			  } else {
			    return true;
			  }
			},
			// 点赞
			toFavorite(item) {
			  if (!this.checkForLogin()) {
			    return;
			  }
			  if (item.upSelf === 1) {
			    //取消点赞
			    upOrCancel({ id: item.id, type: 2 }).then(response => {
			      uni.showToast({
			        title: "取消点赞成功！",
			        icon: 'none'
			      });
				  this.loadData('refresh');
			    });
			  } else {
			    // 点赞
			    upOrCancel({ id: item.id, type: 1 }).then(response => {
			      uni.showToast({
			        title: "点赞成功！",
			        icon: 'none'
			      });
				  this.loadData('refresh');
			    });
			  }
			},
			showInput() {
				this.isShow = true;
			},
			closeInput() {
				this.isShow = false;
			},
			commentCommit() {
				if (!this.checkForLogin()) {
				  return;
				}
				if (this.content === '' || this.content === undefined) {
					return;
				}
				let data = {
				  productId: this.searchParam.productId,
				  content: this.content
				}
				createComment(data).then(() => {
					this.isShow = false;
					this.content = '';
					this.loadData('refresh');
				})
			},
			stopPrevent() {}
		},
	}
</script>

<style lang="scss">
	page,
	.content {
		position: absolute;
		background: $page-color-base;
	}
	.banner-image{
		width: 100%;
	}
	
	.eva-box {
	  display: flex;
	  padding: 20upx 0;
	  width: 100%;
	  border-bottom: 1px solid #b6b6b6;
	
	  .portrait {
	    flex-shrink: 0;
	    width: 80upx;
	    height: 80upx;
	    border-radius: 100px;
	  }
	
	  .right {
	    flex: 1;
	    display: flex;
	    flex-direction: column;
	    font-size: $font-base;
	    color: $font-color-base;
	    padding-left: 26upx;
	
	    .con {
	      font-size: $font-base;
	      color: $font-color-dark;
	      padding: 20upx 0;
		  min-height: 58upx;
	    }
		
		.bot {
			display: flex;
			justify-content: end;
			font-size: $font-sm;
			color: $font-color-light;
			align-items: center;
		}
	  }
	}
	.section-tit {
		font-size: $font-base+2upx;
		color: $font-color-dark;
		background: #fff;
		margin-top: 16upx;
		text-align: center;
		padding-top: 20upx;
		padding-bottom: 20upx;
	}
	/* 商品列表 */
	.goods-list {
		display: flex;
		flex-wrap: wrap;
		padding: 0 30upx;
		background: #fff;
		min-height: 100%;

		.goods-item {
			display: flex;
			flex-direction: column;
			width: 48%;
			padding-bottom: 40upx;

			&:nth-child(2n+1) {
				margin-right: 4%;
			}
		}

		.image-wrapper {
			width: 100%;
			height: 330upx;
			border-radius: 3px;
			background-color: #fff;
			overflow: hidden;

			image {
				width: 100%;
				height: 100%;
				opacity: 1;
				overflow: auto;
			}
		}
		
		.p-b-btn {
		  display: flex;
		  flex-direction: column;
		  align-items: center;
		  justify-content: center;
		  font-size: $font-sm;
		  color: $font-color-base;
		  width: 70upx;
		}
	}
	
.bottom-comment {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 80;
  width: 100vw;
  min-height: 8vh;
  background-color: #fff;
  box-shadow: 0 0 8rpx 4rpx #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28rpx;
 
  .disableinput {
    width: 70%;
    height: 70rpx;
    background-color: #f6f6f6;
    border-radius: 35rpx;
    margin-right: 30rpx;
    font-size: 20rpx;
    color: #767676;
    padding-left: 16rpx;
    display: flex;
    align-items: center;
  }
 
  .bottom-item {
    flex: 1;
    display: flex;
    margin-left: 20rpx;
    align-items: center;
 
    .item-icon {
      font-size: 38rpx;
      padding-left: 10rpx;
    }
 
    .isUp {
      color: $uni-color-primary;
    }
 
    .item-text {
      font-size: 30rpx;
    }
  }
  .relase {
    background-color: $uni-color-primary;
    border-radius: 10rpx;
    font-size: 26rpx;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10rpx 20rpx;
  }
}

.bottom-comment-send {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 80;
  width: 100vw;
  min-height: 8vh;
  background-color: #fff;
  box-shadow: 0 0 8rpx 4rpx #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28rpx;
  
  .relase {
    background-color: $uni-color-primary;
    border-radius: 10rpx;
    font-size: 26rpx;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10rpx 20rpx;
  }
  }
</style>
