export default class ImgGallery extends HTMLElement {
	/* 
		@Attributes-JS:
			[data-onclick]	// modal
			[data-modal]	// <selector>
		@Attributes-CSS
			[data-theme]
			[data-layout]	// flex-masonry, flex-columns, flex-grow
			[data-shape]	// rounded, circle, rectangle 
			[data-filter]	// shadow, grey, shadow
			[data-hover]	// scale, lighten, outline
		@Children
			<img>
			<img-dialog>
		@Listen
			img-selected
			keydown
			click
			focus
		Description
			This component shows images side by side like in a gallery.
			It handles focus, keydown and click events to change the currently selected image.
			Images may be clicked and delegated to a subcomponent like <img-dialog>.
	*/

	_defaults = {
		onclick: 'modal',
		hover: 'outline shadow',
		modal: 'img-dialog', // <selector>
		filter: 'none',
		shape: '', // no default because of FOUC!
		justify: 'center',
		layout: 'flex-masonry',
	}

	_log = false
	_modal
	_imgs

	constructor() {
		super()
	}

	set selectedIndex(newIndex) {

		if (typeof newIndex !== 'number') {
			newIndex = Number(newIndex)
		}

		let oldIndex = this.selectedIndex // in fact gets this._selectedImgIndex

		// checks
		if (newIndex > this._imgs.length - 1) return // return if beyond last item
		if (newIndex < 0) return // return if beyond first item

		// finally change the index
		if (typeof newIndex !== 'undefined') {
			this._selectedIndex = newIndex // update index
		}

		//if (this._log) console.log('oldIndex: ', oldIndex, 'newIndex: ', newIndex)
		this._setCurrent(oldIndex, newIndex)
	}

	get selectedIndex() {
		return Number(this._selectedIndex)
	}

	connectedCallback() {
		// init public
		//this.dataset.justify ??= this._defaults.justify
		//this.dataset.shape ??= this._defaults.shape
		//this.dataset.filter ??= this._defaults.filter
		//this.dataset.hover ??= this._defaults.hover
		//this.dataset.onclick ??= (this.dataset.modal) ? 'modal' : ''

		this.dataset.layout ??= this._defaults.layout

		if (this.dataset.modal) {
			this.dataset.onclick ??= this._defaults.onclick
		}
		if (this.dataset.onclick) {
			this.dataset.modal ??= this._defaults.modal	
		}
		
		this._getSlotted()
		this._configElements()
		this.selectedIndex = 0 // triggers this.setCurrent()

		// event listener
		this.addEventListener('img-selected', this._onImgSelected)
		document.addEventListener('keydown', this._onKeyDown)

		if (this._imgs) {
			this._imgs.forEach((img, index) => {
				img.classList.add('gallery-img')
				img.dataset.index = index // attach an individual img index
				img.addEventListener('click', this._onClick) // add event listeners
				img.addEventListener('focus', this._onFocus) // add event listeners
			})
		}
	}

	_getSlotted() {
		this._modal = this.querySelector(this.dataset.modal)
		if (this.dataset.modal && !this._modal) {
			console.warn('this.dataset.onclick: ', this.dataset.onclick, 'this.dataset.modal: ', this.dataset.modal, 'this._modal: ', this._modal)
		}
		this._imgs = this.querySelectorAll(':scope > img')
		if (!this._imgs) console.warn('this._imgs: ', this._imgs)
	}

	_configElements() {
		this._imgs.forEach(img => {
			img.tabIndex = 0 // make imgs focusable
		})
	}

	_onImgSelected = (evt) => {
		//if (this._log) console.log('[evt] img-selected: ', evt.detail)
		if (this.contains(evt.target)) {
			evt.stopImmediatePropagation()
			this.selectedIndex = evt.detail.index
			this._imgs[this.selectedIndex].focus() // calls this._onFocus()	
		}
	}

	_onKeyDown = (evt) => {
		if (this.contains(evt.target)) {
			evt.stopImmediatePropagation() // If several listeners are attached to the same element for the same event type, they are called in the order in which they were added. If stopImmediatePropagation() is invoked during one such call, no remaining listeners will be called, either on that element or any other element.

			switch (evt.key) {
				case 'Enter':
					this._onEnter(evt)
					// implement! how set selected index when evt.target is not img but body (enter)
					break
				case 'ArrowLeft':
					this._onKeyLeft(evt)
					break;
				case 'ArrowRight':
					this._onKeyRight(evt)
					break;
			}
		}
	}

	_onKeyLeft() {
		this.selectedIndex = this.selectedIndex - 1
		this._imgs[this.selectedIndex].focus() // calls this._onFocus()
	}

	_onKeyRight() {
		this.selectedIndex = this.selectedIndex + 1
		this._imgs[this.selectedIndex].focus() // calls this._onFocus()
	}

	_onClick = (evt) => {
		this.selectedIndex = evt.target.dataset.index
		this._openModal()
	}

	_onEnter(evt) {
		if (this._log) console.log('_onEnter(): ', evt.target)
		// this img-gallery contains the focused element
		this.selectedIndex = document.activeElement.dataset.index
		this._openModal()
	}

	_onFocus = (evt) => {
		this.selectedIndex = evt.target.dataset.index
	}

	_openModal() {
		if (this._modal) {
			if (this._log) console.log('openModal()')
			this._modal.show(this.selectedIndex)
		}
	}

	_setCurrent(oldIndex, newIndex) {
		// then update classes
		if (Number.isInteger(oldIndex)) this._imgs[oldIndex].classList.remove('current') //
		if (Number.isInteger(newIndex)) this._imgs[newIndex].classList.add('current') //
	}

}