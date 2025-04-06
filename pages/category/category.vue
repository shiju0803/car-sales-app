<template>
	<view class="content">
		<scroll-view scroll-y class="left-aside">
			<view v-for="item in flist" :key="item.id" class="f-item b-b" :class="{active: item.id === currentId}" @click="tabtap(item)">
				{{item.name}}
			</view>
		</scroll-view>
		<scroll-view scroll-with-animation scroll-y class="right-aside">
			<view class="navbar">
				<view class="nav-item" :class="{current: filterIndex === 0}" @click="tabClick(0)">
					综合排序
				</view>
				<view class="nav-item" :class="{current: filterIndex === 2}" @click="tabClick(2)">
					<text>价格</text>
					<view class="p-box">
						<text :class="{active: priceOrder === 1 && filterIndex === 2}" class="yticon icon-shang"></text>
						<text :class="{active: priceOrder === 2 && filterIndex === 2}" class="yticon icon-shang xia"></text>
					</view>
				</view>
			</view>
			<view class="guess-section">
				<view v-for="(item, index) in slist" :key="index" class="guess-item" @click="navToList(item.id)">
					<view class="image-wrapper">
						<image :src="item.pic" mode="aspectFill"></image>
					</view>
					<text class="title clamp">{{item.name}}</text>
					<text class="title2 clamp">{{item.subTitle}}</text>
					<text class="price">￥{{item.price / 10000}} 万起</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { searchProductList, fetchCategoryTreeList } from '@/api/product.js';
	export default {
		data() {
			return {
				currentId: 0,
				flist: [],
				slist: [],
				filterIndex: 0,
				priceOrder: 0, //1 价格从低到高 2价格从高到低
				searchParam: {
					productCategoryId: null,
					pageNum: 1,
					pageSize: 5,
					sort: 0
				}
			}
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			async loadData() {
				fetchCategoryTreeList().then(response => {
					this.flist = response.data;
					this.currentId = response.data[0].id;
					this.tabtap({"id": this.currentId})
				})
			},
			//一级分类点击
			tabtap(item) {
				this.currentId = item.id;
				this.loadSortData('refresh', 1);
			},
			navToList(sid) {
				uni.navigateTo({
					url: `/pages/product/product?id=${sid}`
				})
			},
			//筛选点击
			tabClick(index) {
				if (this.filterIndex === index && index !== 2) {
					return;
				}
				this.filterIndex = index;
				if (index === 2) {
					this.priceOrder = this.priceOrder === 1 ? 2 : 1;
				} else {
					this.priceOrder = 0;
				}
				uni.pageScrollTo({
					duration: 300,
					scrollTop: 0
				})
				this.loadSortData('refresh', 1);
				uni.showLoading({
					title: '正在加载'
				})
			},
			//加载商品 ，带下拉刷新和上滑加载
			async loadSortData(type = 'add', loading) {
				this.searchParam.productCategoryId = this.currentId;
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
					this.searchParam.pageNum = 1;
					this.slist = [];
				}
				if(this.filterIndex==0){
					this.searchParam.sort=0;
				}
				if (this.filterIndex === 1) {
					this.searchParam.sort = 2;
				}
				if (this.filterIndex === 2) {
					if (this.priceOrder == 1) {
						this.searchParam.sort = 3;
					} else {
						this.searchParam.sort = 4;
					}
				}
				searchProductList(this.searchParam).then(response => {
					let productList = response.data.list;
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
						this.slist = this.slist.concat(productList);
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
		}
	}
</script>

<style lang='scss'>
	page,
	.content {
		height: 100%;
		background-color: #f8f8f8;
	}

	.content {
		display: flex;
	}
	
	.navbar {
		position: fixed;
		right: 1px;
		top: var(--window-top);
		display: flex;
		width: 73%;
		height: 80upx;
		background: #fff;
		z-index: 10;
	
		.nav-item {
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			font-size: 30upx;
			color: $font-color-dark;
			position: relative;
	
			&.current {
				color: $base-color;
	
				&:after {
					content: '';
					position: absolute;
					left: 50%;
					bottom: 0;
					transform: translateX(-50%);
					width: 120upx;
					height: 0;
					border-bottom: 4upx solid $base-color;
				}
			}
		}
	
		.p-box {
			display: flex;
			flex-direction: column;
	
			.yticon {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 30upx;
				height: 14upx;
				line-height: 1;
				margin-left: 4upx;
				font-size: 26upx;
				color: #888;
	
				&.active {
					color: $base-color;
				}
			}
	
			.xia {
				transform: scaleY(-1);
			}
		}
	
		.cate-item {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			width: 80upx;
			position: relative;
			font-size: 44upx;
	
			&:after {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				border-left: 1px solid #ddd;
				width: 0;
				height: 36upx;
			}
		}
	}

	.left-aside {
		flex-shrink: 0;
		width: 200upx;
		height: 100%;
		background-color: #fff;
	}

	.f-item {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100upx;
		font-size: 28upx;
		color: $font-color-base;
		position: relative;

		&.active {
			color: $base-color;
			background: #f8f8f8;

			&:before {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				height: 36upx;
				width: 8upx;
				background-color: $base-color;
				border-radius: 0 4px 4px 0;
				opacity: .8;
			}
		}
	}

	.right-aside {
		flex: 1;
		overflow: hidden;
		padding-left: 20upx;
		padding-top: 84upx;
	}

	.s-list {
		margin-top: 20upx;
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		background: #fff;
		padding-top: 12upx;

		&:after {
			content: '';
			flex: 99;
			height: 0;
		}
	}

	.s-item {
		flex-shrink: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		width: 176upx;
		font-size: 26upx;
		color: #666;
		padding-bottom: 20upx;

		image {
			width: 140upx;
			height: 140upx;
		}
	}
	
	/* 猜你喜欢 */
	.guess-section {
		display: flex;
		flex-wrap: wrap;
		padding: 30upx 30upx;
		background: #fff;
	
		.guess-item {
			display: flex;
			flex-direction: column;
			width: 100%;
			padding-bottom: 40upx;
		}
	
		.image-wrapper {
			width: 100%;
			height: 330upx;
			border-radius: 3px;
			overflow: hidden;
	
			image {
				width: 100%;
				height: 100%;
				opacity: 1;
			}
		}
		
		.image-wrapper-brand {
			width: 100%;
			height: 150upx;
			border-radius: 3px;
			overflow: hidden;
		
			image {
				width: 100%;
				height: 100%;
				opacity: 1;
			}
		}
	
		.title {
			font-size: $font-lg;
			color: $font-color-dark;
			line-height: 60upx;
		}
	
		.title2 {
			font-size: $font-sm;
			color: $font-color-light;
			line-height: 50upx;
		}
	
		.price {
			font-size: $font-lg;
			color: $uni-color-primary;
			line-height: 1;
		}
	}
	
</style>
