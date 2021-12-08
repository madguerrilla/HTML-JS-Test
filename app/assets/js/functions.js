'use strict';
const $ = require('jquery');
require('webpack-jquery-ui/sortable');
require('webpack-jquery-ui/slide-effect');

$(() => {
	const pageItems = document.querySelectorAll('.c-aside__item');
	const pageItemsRemove = document.querySelectorAll('.c-aside__item-remove');
	const modal = document.querySelector('#modal');
	const remove = document.querySelector('#remove');
	const filterInput = document.querySelector('#c-aside__filter-input');
	const filterInputRemove = document.querySelector('.c-aside__filter-remove');
	var itemToRemove;

	const tabsLinks = document.querySelectorAll('.c-page__tab a');

	$('.o-aside__list').sortable();
	$('.o-aside__list').disableSelection();
	pageItems.forEach(function(item) {
		item.addEventListener('click', function() {
			let itemInput = this.querySelector('input');
			switch (itemInput.checked) {
				case true:
					this.classList.add('c-aside__item--selected');
					break;
				case false:
					this.classList.remove('c-aside__item--selected');
					break;
			}
		});
	});
	pageItemsRemove.forEach(function(itemRemove) {
		itemRemove.addEventListener('click', function() {
			itemToRemove = this.parentNode;
			$('#modal').modal('toggle');
		});
	});
	remove.addEventListener('click', function() {
		$('#modal').modal('toggle');
		itemToRemove.classList.add('removed');
		console.log(itemToRemove.id);
		$('#' + itemToRemove.id).toggle('slide');
	});

	filterInput.addEventListener('keyup', function() {
		if (this && this.value) {
			$('.o-aside__list').addClass('o-aside__list--filtering');
			filterInputRemove.classList.add('d-block');
			$('.c-aside__item').removeClass('c-aside__item--filtered');
			$('.c-aside__item[data-page-name^="' + this.value + '"]:not(.removed)').addClass('c-aside__item--filtered');

		} else {
			$('.o-aside__list').removeClass('o-aside__list--filtering');
			$('.c-aside__item').removeClass('c-aside__item--filtered');
			filterInputRemove.classList.remove('d-block');
		}
	});
	filterInputRemove.addEventListener('click', function() {
		filterInput.value = '';
		filterInput.focus();
		filterInputRemove.classList.remove('d-block');
		$('.o-aside__list').removeClass('o-aside__list--filtering');
	});

	tabsLinks.forEach(function(item) {
		item.addEventListener('click', function(e) {
			e.preventDefault();
			let tabChoice = this.getAttribute('data-target');
			let tabContent = document.querySelector('#' + tabChoice);
			if (!tabContent.classList.contains('c-page__tab-content--active')) {
				document.querySelector('.c-page__tab-content--active').classList.remove('c-page__tab-content--active');
				tabContent.classList.add('c-page__tab-content--active');
				document.querySelector('.c-page__tab--active').classList.remove('c-page__tab--active');
				this.parentNode.classList.add('c-page__tab--active');
			}
		});
	});
});