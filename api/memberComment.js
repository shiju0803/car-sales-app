import request from '@/utils/requestUtil'

export function createComment(data) {
	return request({
		method: 'POST',
		url: '/member/productComment/add',
		data: data
	})
}

export function replayComment(data) {
	return request({
		method: 'POST',
		url: '/member/productComment/replay',
		data: data
	})
}

export function upOrCancel(params) {
	return request({
		method: 'GET',
		url: '/member/productComment/upOrCancel',
		params: params
	})
}

export function fetchCommentList(params) {
	return request({
		method: 'GET',
		url: '/member/productComment/list',
		params: params
	})
}

export function delComment() {
	return request({
		method: 'POST',
		url: '/member/productComment/delete'
	})
}