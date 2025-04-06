<template>
	<view class="container">
		<view class="left-bottom-sign"></view>
		<view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
		<view class="right-top-sign"></view>
		<!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
		<view class="wrapper">
			<view class="input-content">
				<view class="input-item">
					<text class="tit">用户名</text>
					<input type="text" v-model="username" placeholder="请输入用户名" maxlength="11"/>
				</view>
				<view class="input-item">
					<text class="tit">密码</text>
					<input type="text" v-model="password" placeholder="8-18位不含特殊字符的数字、字母组合" placeholder-class="input-empty" maxlength="20"
					 password/>
				</view>
				<view class="input-item">
					<text class="tit">手机号</text>
					<input type="text" v-model="telephone" placeholder="请输入手机号" placeholder-class="input-empty" maxlength="12"/>
				</view>
				<view class="send-item">
					<text class="tit">验证码</text>
					<input type="text" v-model="authCode" placeholder="请输入验证码" placeholder-class="input-empty" maxlength="20"/>
				    <button :disabled="btnDis" class="send-btn" @click="getAuthCode">{{ btnText }}</button>
				</view>
			</view>
			<button class="confirm-btn" @click="toRegister" :disabled="logining">注册</button>
		</view>
	</view>
</template>

<script>
import { memberRegister, getAuthCode } from '@/api/member.js';
	export default {
		data() {
			return {
				username: '',
				password: '',
				telephone: '',
				authCode: '',
				logining: false,
				btnText: '获取验证码',
				btnDis: false,// 发送验证码按钮不禁用
			}
		},
		onLoad() {
		},
		methods: {
			navBack() {
				uni.navigateBack();
			},
			async toRegister() {
				this.logining = true;
				memberRegister({
					username: this.username,
					password: this.password,
					telephone: this.telephone,
					authCode: this.authCode
				}).then(response => {
					let token = response.data.tokenHead+response.data.token;
					uni.setStorageSync('token',token);
					uni.setStorageSync('username',this.username);
					uni.setStorageSync('password',this.password);
					memberInfo().then(response=>{
						this.login(response.data);
						uni.navigateTo({url:'/pages/index/index'});
					});
				}).catch(() => {
					this.logining = false;
				});
			},
			async getAuthCode() {
				getAuthCode({
					telephone: this.telephone
				}).then(response => {
					console.log('验证码：' + response.data)
					this.countDown();
				}).catch(() => {
			});
			},
			// 验证码倒计时
			countDown() {
			  	// 初始化定时器
				let t = null;
				// 倒计时1分钟
				let timer = 60;
				// 按钮禁用
				this.btnDis = true;
				// 计时器清零
				clearInterval(t);
				// 按钮显示时间
				this.btnText = `${timer}s`;
				t = setInterval(() => {
				// 当倒计时完时，显示重新发送,按钮开启
					if (timer == 0) {
						clearInterval(t);
						this.btnText = "重新发送";
						this.btnDis = false;
						return;
					}
					// 实现倒计时效果
					timer--;
					this.btnText = `${timer}s`;
				}, 1000)
			}
		},
	}
</script>

<style lang='scss'>
	page {
		background: #fff;
	}
	
	.send-section {
		font-size: $font-sm+2upx;
		color: $font-color-spec;
		text-align: center;
		margin-top: 50upx;
		margin-right: 100upx;
	}
	
	.empty {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100vh;
		padding-bottom: 100upx;
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		background: #fff;
	
		image {
			width: 420upx;
			height: 420upx;
			margin-bottom: 30upx;
		}
		.empty-tips {
			display: flex;
			font-size: $font-sm+16upx;
			color: $font-color-disabled;
		
			.navigator {
				color: $uni-color-primary;
				margin-left: 0upx;
			}
		}
	}

	.container {
		padding-top: 115px;
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background: #fff;
	}

	.wrapper {
		position: relative;
		z-index: 90;
		background: #fff;
		padding-bottom: 40upx;
	}

	.back-btn {
		position: absolute;
		left: 40upx;
		z-index: 9999;
		padding-top: var(--status-bar-height);
		top: 40upx;
		font-size: 40upx;
		color: $font-color-dark;
	}

	.left-top-sign {
		font-size: 120upx;
		color: $page-color-base;
		position: relative;
		left: -16upx;
	}

	.right-top-sign {
		position: absolute;
		top: 80upx;
		right: -30upx;
		z-index: 95;

		&:before,
		&:after {
			display: block;
			content: "";
			width: 400upx;
			height: 80upx;
			background: #b4f3e2;
		}

		&:before {
			transform: rotate(50deg);
			border-radius: 0 50px 0 0;
		}

		&:after {
			position: absolute;
			right: -198upx;
			top: 0;
			transform: rotate(-50deg);
			border-radius: 50px 0 0 0;
			/* background: pink; */
		}
	}

	.left-bottom-sign {
		position: absolute;
		left: -270upx;
		bottom: -320upx;
		border: 100upx solid #d0d1fd;
		border-radius: 50%;
		padding: 180upx;
	}
	
	.confirm-btn {
		width: 630upx;
		height: 76upx;
		line-height: 76upx;
		border-radius: 50px;
		margin-top: 70upx;
		background: $uni-color-success;
		color: #fff;
		font-size: $font-lg;
	
		&:after {
			border-radius: 100px;
		}
	}
	
	.input-content {
		padding: 0 60upx;
	}
	
	.input-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		padding: 0 30upx;
		background: $page-color-light;
		height: 120upx;
		border-radius: 4px;
		margin-bottom: 50upx;
	
		&:last-child {
			margin-bottom: 0;
		}
	
		.tit {
			height: 50upx;
			line-height: 56upx;
			font-size: $font-sm+2upx;
			color: $font-color-base;
		}
		
		.send-btn {
			height: 50upx;
			line-height: 56upx;
			font-size: $font-sm+2upx;
			color: $font-color-base;
			margin: 0;
		}
	
		input {
			height: 60upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			width: 100%;
		}
	}
	
	.send-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		padding: 0 30upx;
		background: $page-color-light;
		height: 120upx;
		border-radius: 4px;
		margin-bottom: 50upx;
		position: relative;
	
		&:last-child {
			margin-bottom: 0;
		}
		
		.send-btn {
			position: absolute;
			right: 22rpx;
			top: 30rpx;
			color: #FFF;
			font-size: 30rpx;
			height: 50rpx;
			line-height: 50rpx;
			padding: 0 25rpx;
			background: $uni-color-success;
			border-radius: 50rpx;
		}
	
		.tit {
			height: 50upx;
			line-height: 56upx;
			font-size: $font-sm+2upx;
			color: $font-color-base;
		}
	
		input {
			height: 60upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			width: 100%;
		}
	}
</style>
