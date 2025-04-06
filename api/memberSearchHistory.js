import request from '@/utils/requestUtil'

export function createSearchHistory(data) {
	return request({
		method: 'POST',
		url: '/member/SearchHistory/create',
		data: data
	})
}

export function delSearchHistory(data) {
	return request({
		method: 'POST',
		url: '/member/SearchHistory/delete',
		params: data
	})
}

export function fetchSearchHistoryList(params) {
	return request({
		method: 'GET',
		url: '/member/SearchHistory/list',
		params: params
	})
}

export function clearHistory() {
	return request({
		method: 'POST',
		url: '/member/SearchHistory/clear'
	})
}