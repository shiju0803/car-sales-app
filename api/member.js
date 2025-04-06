import request from '@/utils/requestUtil'

export function memberLogin(data) {
	return request({
		method: 'POST',
		url: '/sso/login',
		header: {
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		},
		data: data
	})
}

export function memberRegister(data) {
	return request({
		method: 'POST',
		url: '/sso/register',
		header: {
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		},
		data: data
	})
}

export function updatePassword(data) {
	return request({
		method: 'POST',
		url: '/sso/updatePassword',
		header: {
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		},
		data: data
	})
}

export function getAuthCode(params) {
	return request({
		method: 'GET',
		url: '/sso/getAuthCode',
		params: params
	})
}

export function memberInfo() {
	return request({
		method: 'GET',
		url: '/sso/info'
	})
}
