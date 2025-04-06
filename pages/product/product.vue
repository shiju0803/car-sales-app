<template>
  <view class="container">
    <view class="carousel">
      <swiper indicator-dots circular=true duration="400">
        <swiper-item class="swiper-item" v-for="(item,index) in imgList" :key="index">
          <view class="image-wrapper">
            <image :src="item.src" class="loaded" mode="aspectFill"></image>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <view class="introduce-section">
		<view class="box">
			<text class="title">{{ product.name }}</text><br>
			<text class="title2">{{ product.subTitle }}</text>
			<view class="price-box">
			  <text class="price-tip">¥</text>
			  <text class="price">{{ product.price / 10000 }} 万起</text>
			</view>
		</view>
	  <view class="p-b-btn" :class="{active: favorite}" @click="toFavorite">
	    <text class="yticon icon-shoucang"></text>
	    <text>收藏</text>
	  </view>
    </view>
	
	<!-- 评价 -->
	<view class="eva-section">
		<view class="e-header">
		    <text class="tit">评价</text>
			<text>({{totalcomment}})</text>
			<text class="tip"></text>
			<text class="yticon icon-you" @click="toCommentList"></text>
		</view>
		<view class="eva-box" v-if="totalcomment > 0">
			<image class="portrait" :src="commentList[0].memberIcon ? item.memberIcon : '../../static/tab-my.png'" mode="aspectFill"></image>
			<view class="right">
				<text class="name">{{commentList[0].memberNickName}}</text>
				<text class="con">{{commentList[0].content}}</text>
				<view class="bot">
					<text class="time">{{commentList[0].createTime}}</text>
					<view class="p-b-btn">
					  <uni-icons type="hand-up" :color = "commentList[0].upSelf === 1 ? 'red' : ''" size="20"></uni-icons>
					</view>
					<text class="time">{{commentList[0].readCount}}</text>
				</view>
			</view>
		</view>
		<view class="eva-box" v-else>
			<image class="portrait" src="" mode="aspectFill"></image>
			<view class="right">
				<text class="name"></text>
				<text class="con">{{ '暂无评论,快去发表一条吧~~' }}</text>
				<view class="bot">
					<text class="attr"></text>
					<text class="time"></text>
				</view>
			</view>
		</view>
	</view>

    <!-- 品牌信息 -->
    <view class="brand-info">
      <view class="d-header">
        <text>品牌信息</text>
      </view>
      <view class="brand-box" @click="navToBrandDetail()">
        <view class="image-wrapper">
          <image :src="brand.logo" class="loaded" mode="aspectFit"></image>
        </view>
        <view class="title">
          <text>{{ brand.name }}</text>
          <text>品牌首字母：{{ brand.firstLetter }}</text>
        </view>
      </view>
    </view>

    <view class="detail-desc">
      <view class="d-header">
        <text>图文详情</text>
      </view>
      <rich-text :nodes="desc"></rich-text>
    </view>
  </view>
</template>

<script>
import share from '@/components/share';
import { fetchProductDetail } from '@/api/product.js';
import { createComment, replayComment, fetchCommentList, delComment } from '@/api/memberComment.js';
import { createReadHistory } from '@/api/memberReadHistory.js';
import { createProductCollection, deleteProductCollection, productCollectionDetail } from '@/api/memberProductCollection.js';
import { mapState } from 'vuex';

export default {
  components: {},
  data() {
    return {
      specClass: 'none',
      attrClass: 'none',
      specSelected: [],
      favorite: false,
      shareList: [],
      imgList: [],
      desc: '',
      specList: [],
      specChildList: [],
      product: {},
      brand: {},
      attrList: [],
      promotionTipList: [],
      commentList: [],
	  totalcomment: 0
    };
  },
  async onLoad(options) {
    let id = options.id;
    this.loadData(id);
  },
  computed: {
    ...mapState(['hasLogin'])
  },
  filters: {},
  methods: {
    async loadData(id) {
      fetchProductDetail(id).then(response => {
        this.product = response.data.product;
        this.brand = response.data.brand;
        this.initImgList();
        this.initProductDesc();
        this.handleReadHistory();
        this.initProductCollection();
		this.fetchCommentList();
      });
    },
    //收藏
    toFavorite() {
      if (!this.checkForLogin()) {
        return;
      }
      if (this.favorite) {
        //取消收藏
        deleteProductCollection({
          productId: this.product.id
        }).then(response => {
          uni.showToast({
            title: "取消收藏成功！",
            icon: 'none'
          });
          this.favorite = !this.favorite;
        });
      } else {
        //收藏
        let productCollection = {
          productId: this.product.id,
          productName: this.product.name,
          productPic: this.product.pic,
          productPrice: this.product.price,
          productSubTitle: this.product.subTitle
        }
        createProductCollection(productCollection).then(response => {
          uni.showToast({
            title: "收藏成功！",
            icon: 'none'
          });
          this.favorite = !this.favorite;
        });
      }
    },
    stopPrevent() {
    },
    //设置头图信息
    initImgList() {
      let tempPics = this.product.albumPics.split(',');
      tempPics.unshift(this.product.pic);
      for (let item of tempPics) {
        if (item != null && item !== '') {
          this.imgList.push({
            src: item
          });
        }
      }
    },
    //初始化商品详情信息
    initProductDesc() {
      let rawhtml = this.product.detailMobileHtml;
      let tempNode = document.createElement('div');
      tempNode.innerHTML = rawhtml;
      let imgs = tempNode.getElementsByTagName('img');
      for (let i = 0; i < imgs.length; i++) {
        imgs[i].style.width = '100%';
        imgs[i].style.height = 'auto';
        imgs[i].style.display = 'block';
      }
      this.desc = tempNode.innerHTML;
    },
	// 初始化评论数据
	fetchCommentList() {
		let data = {
		  productId: this.product.id,
		  pageNum: 1,
		  pageSize: 1
		}
		fetchCommentList(data).then(resp => {
			this.commentList = resp.data.list;
			this.totalcomment = resp.data.total;
		})
	},
    //处理创建浏览记录
    handleReadHistory() {
      if (this.hasLogin) {
        let data = {
          productId: this.product.id,
          productName: this.product.name,
          productPic: this.product.pic,
          productPrice: this.product.price,
          productSubTitle: this.product.subTitle,
        }
        createReadHistory(data);
      }
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
    //初始化收藏状态
    initProductCollection() {
      if (this.hasLogin) {
        productCollectionDetail({
          productId: this.product.id
        }).then(response => {
          this.favorite = response.data != null;
        });
      }
    },
    //跳转到品牌详情页
    navToBrandDetail() {
      let id = this.brand.id;
      uni.navigateTo({
        url: `/pages/brand/brandDetail?id=${id}`
      })
    },
	toCommentList() {
		let id = this.product.id;
		uni.navigateTo({
		  url: `/pages/product/productComment?id=${id}`
		})
	}
  },
}
</script>

<style lang='scss'>
page {
  background: $page-color-base;
  padding-bottom: 160upx;
}

.icon-you {
  font-size: $font-base + 2upx;
  color: #888;
}

.carousel {
  height: 722upx;
  position: relative;

  swiper {
    height: 100%;
  }

  .image-wrapper {
    width: 100%;
    height: 100%;
  }

  .swiper-item {
    display: flex;
    justify-content: center;
    align-content: center;
    height: 750upx;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
    }
  }

}

/* 标题简介 */
.introduce-section {
  background: #fff;
  padding: 20upx 30upx;
  display: flex;
  
  .box {
	  width: 90%;
  }
  
  .title {
    font-size: 32upx;
    color: $font-color-dark;
    height: 50upx;
    line-height: 50upx;
  }

  .title2 {
    font-size: 28upx;
    color: $font-color-light;
    height: 46upx;
    line-height: 46upx;
  }

  .price-box {
    display: flex;
    align-items: baseline;
    height: 64upx;
    padding: 10upx 0;
    font-size: 26upx;
    color: $uni-color-primary;
  }

  .price {
    font-size: $font-lg + 2upx;
  }

  .m-price {
    margin: 0 12upx;
    color: $font-color-light;
    text-decoration: line-through;
  }

  .coupon-tip {
    align-items: center;
    padding: 4upx 10upx;
    background: $uni-color-primary;
    font-size: $font-sm;
    color: #fff;
    border-radius: 6upx;
    line-height: 1;
    transform: translateY(-4upx);
  }

  .bot-row {
    display: flex;
    align-items: center;
    height: 50upx;
    font-size: $font-sm;
    color: $font-color-light;

    text {
      flex: 1;
    }
  }

  .p-b-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: $font-sm;
    color: $font-color-base;
    width: 96upx;
    height: 80upx;

    .yticon {
      font-size: 40upx;
      line-height: 48upx;
      color: $font-color-light;
    }

    &.active,
    &.active .yticon {
      color: $uni-color-primary;
    }

    .icon-fenxiang2 {
      font-size: 42upx;
      transform: translateY(-2upx);
    }

    .icon-shoucang {
      font-size: 46upx;
    }
  }
}

/* 分享 */
.share-section {
  display: flex;
  align-items: center;
  color: $font-color-base;
  background: linear-gradient(left, #fdf5f6, #fbebf6);
  padding: 12upx 30upx;

  .share-icon {
    display: flex;
    align-items: center;
    width: 70upx;
    height: 30upx;
    line-height: 1;
    border: 1px solid $uni-color-primary;
    border-radius: 4upx;
    position: relative;
    overflow: hidden;
    font-size: 22upx;
    color: $uni-color-primary;

    &:after {
      content: '';
      width: 50upx;
      height: 50upx;
      border-radius: 50%;
      left: -20upx;
      top: -12upx;
      position: absolute;
      background: $uni-color-primary;
    }
  }

  .icon-xingxing {
    position: relative;
    z-index: 1;
    font-size: 24upx;
    margin-left: 2upx;
    margin-right: 10upx;
    color: #fff;
    line-height: 1;
  }

  .tit {
    font-size: $font-base;
    margin-left: 10upx;
  }

  .icon-bangzhu1 {
    padding: 10upx;
    font-size: 30upx;
    line-height: 1;
  }

  .share-btn {
    flex: 1;
    text-align: right;
    font-size: $font-sm;
    color: $uni-color-primary;
  }

  .icon-you {
    font-size: $font-sm;
    margin-left: 4upx;
    color: $uni-color-primary;
  }
}

.c-list {
  font-size: $font-sm + 2upx;
  color: $font-color-base;
  background: #fff;

  .c-row {
    display: flex;
    align-items: center;
    padding: 20upx 30upx;
    position: relative;
  }

  .tit {
    width: 140upx;
  }

  .con {
    flex: 1;
    color: $font-color-dark;

    .selected-text {
      margin-right: 10upx;
    }
  }

  .bz-list {
    height: 40upx;
    font-size: $font-sm+2upx;
    color: $font-color-dark;

    text {
      display: inline-block;
      margin-right: 30upx;
    }
  }

  .con-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    color: $font-color-dark;
    line-height: 40upx;
  }

  .red {
    color: $uni-color-primary;
  }
}

/* 评价 */
.eva-section {
  display: flex;
  flex-direction: column;
  padding: 20upx 30upx;
  background: #fff;
  margin-top: 16upx;

  .e-header {
    display: flex;
    align-items: center;
    height: 70upx;
    font-size: $font-sm + 2upx;
    color: $font-color-light;

    .tit {
      font-size: $font-base + 2upx;
      color: $font-color-dark;
      margin-right: 4upx;
    }

    .tip {
      flex: 1;
      text-align: right;
    }

    .icon-you {
      margin-left: 10upx;
    }
  }
}

.eva-box {
  display: flex;
  padding: 20upx 0;

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

/*  详情 */
.detail-desc {
  background: #fff;
  margin-top: 16upx;

  .d-header {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80upx;
    font-size: $font-base + 2upx;
    color: $font-color-dark;
    position: relative;

    text {
      padding: 0 20upx;
      background: #fff;
      position: relative;
      z-index: 1;
    }

    &:after {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateX(-50%);
      width: 300upx;
      height: 0;
      content: '';
      border-bottom: 1px solid #ccc;
    }
  }
}

.detail-desc > > > img {
  width: 100%;
  height: auto;
}

.no-padding {
  padding: 0upx 0upx;
}

/*  弹出层 */
.popup {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 99;

  &.show {
    display: block;

    .mask {
      animation: showPopup 0.2s linear both;
    }

    .layer {
      animation: showLayer 0.2s linear both;
    }
  }

  &.hide {
    .mask {
      animation: hidePopup 0.2s linear both;
    }

    .layer {
      animation: hideLayer 0.2s linear both;
    }
  }

  &.none {
    display: none;
  }

  .mask {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .layer {
    position: fixed;
    z-index: 99;
    bottom: 0;
    width: 100%;
    min-height: 40vh;
    border-radius: 10upx 10upx 0 0;
    background-color: #fff;

    .btn {
      height: 66upx;
      line-height: 66upx;
      border-radius: 100upx;
      background: $uni-color-primary;
      font-size: $font-base + 2upx;
      color: #fff;
      margin: 30upx auto 20upx;
    }
  }

  @keyframes showPopup {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes hidePopup {
    0% {
      opacity: 1;
    }

    100% {
      opacity: 0;
    }
  }

  @keyframes showLayer {
    0% {
      transform: translateY(120%);
    }

    100% {
      transform: translateY(0%);
    }
  }

  @keyframes hideLayer {
    0% {
      transform: translateY(0);
    }

    100% {
      transform: translateY(120%);
    }
  }
}

.brand-info {
  margin-top: 16upx;
  background-color: #fff;
  display: flex;
  flex-direction: column;

  .brand-box {
    display: flex;
    align-items: center;
    padding: 30upx 50upx;

    .image-wrapper {
      width: 210upx;
      height: 70upx;

      image {
        width: 100%;
        height: 100%;
      }
    }

    .title {
      flex: 1;
      display: flex;
      flex-direction: column;
      font-size: $font-lg+4upx;
      margin-left: 30upx;
      color: $font-color-dark;

      text:last-child {
        font-size: $font-sm;
        color: $font-color-light;
        margin-top: 8upx;

        &.Skeleton {
          width: 220upx;
        }
      }
    }
  }

  .d-header {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80upx;
    font-size: $font-base + 2upx;
    color: $font-color-dark;
    position: relative;

    text {
      padding: 0 20upx;
      background: #fff;
      position: relative;
      z-index: 1;
    }

    &:after {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateX(-50%);
      width: 300upx;
      height: 0;
      content: '';
      border-bottom: 1px solid #ccc;
    }
  }
}
</style>
