function __Query__ ({
  id,
  data,
  slice = 50,
  placeHolder = '请选择',
  queryKey,
  type = 'single',
  maxTagCount = 0,
  maxTagPlaceholder = undefined,
  clear = false
}) {
  this.__Data__ = data
  this.__ShowData__ = []
  this.__Id__ = id
  this.__Dom__ = document.getElementById(this.__Id__)
  this.__Open__ = false
  this.__QueryDelay__ = 300
  this.__Slice__ = slice
  this.__FoucsIndex__ = -1
  this.__PlaceHolder__ = placeHolder
  this.__QueryKey__ = queryKey
  this.__Type__ = type
  this.__QueryResult__ = false
  this.__MaxTagCount__ = Number(maxTagCount)
  this.__Disabled__ = false
  this.__Clear__ = clear

  this.__Key__ = new Date().getTime()

  this.__ObserverInfo__ = {}
  this.__Observer__ = undefined
  if (this.__Type__ === 'single') {
      this.__Val__ = ''
      this.__ValLabel__ = ''
  } else {
      this.__Val__ = []
      this.__ValLabel__ = []
  }

  this.maxTagPlaceholder = maxTagPlaceholder
  this.init()
}
__Query__.prototype.init = function () {
  this.renderDom()
  this.getDomObj()
  this.fnHandle()
  this.query('', true)
  this.creatCssStyle()
  this.autoScroll()
}

__Query__.prototype.setKey = function () {
  return `data-q-${this.__Key__}`
}

__Query__.prototype.renderDom = function () {
  var childrens = ''
  childrens = `
      <div class="__Q__select" ${this.setKey()}>
          <div class="__Q__multiple__item__box" ${this.setKey()}></div>
          <input class="__Q__input" type="text" placeHolder="${this.__PlaceHolder__}" ${this.setKey()}></input>
          <i class="__Q__tag" ${this.setKey()}></i>
      </div>
      <div class="__Q__Box" ${this.setKey()}></div>
  `
  this.__Dom__.innerHTML = childrens
}


__Query__.prototype.getDomObj = function () {
  // 挂载在 this 上的 dom

  // __Q__input
  this.__Input__ = document.querySelector(`.__Q__input[${this.setKey()}]`)

  // __Q__multiple__item__box
  this.__Multiple__Item__Box = document.querySelector(`.__Q__multiple__item__box[${this.setKey()}]`)

  // __Q__Box
  this.__Box__ = document.querySelector(`.__Q__Box[${this.setKey()}]`)

  // __Q__tag_arrow
  this.__tag_arrow = document.querySelector(`.__Q__tag[${this.setKey()}]`)
}

__Query__.prototype.clickInput = function () {
  this.__Open__ ? this.closeBox() : this.openBox()
}

__Query__.prototype.fnHandle = function () {
  var that = this
  this.__Input__.addEventListener('click', this.clickInput.bind(this, null))
  this.__Input__.addEventListener('input', this.debounce(function (e) {
      e = e || window.event
      var target = e.target
      that.query(target.value)
  }, this.__QueryDelay__))
  this.__Box__.addEventListener('click', function (e) {
      e = e || window.event
      var target = e.target
      if (that.hasClassName(target, '__Q__Item')) {
          that.handleChange(e.target.dataset[that.__QueryKey__], e.target)
      }
  })

  this.__Multiple__Item__Box.addEventListener('click', this.debounce(function (e) {
      that.deleteMultipleItem(e)
  }, 0))


  this.__tag_arrow.addEventListener('click', this.debounce(function (e) {
      that.clear(e)
  }, 0))

  document.body.addEventListener('click', function(e) {
      e = e || window.event
      var target = e.target
      if (!that.hasClassName(target, '__Q__input') && !that.hasClassName(target, '__Q__Item')) {
          that.closeBox()
      }
  })


  this.__Dom__.addEventListener('keydown', this.debounce(function (e) {
      that.handleKeydown(e)
  }, 0))
}

__Query__.prototype.autoScroll = function (items) {
  
  this.__Observer__ = new IntersectionObserver((entries, index) => {
    entries.forEach(item => {
      this.__ObserverInfo__[item.target.dataset[this.__QueryKey__]] = item.isIntersecting
    })
  }, { root: this.__Box__ , rootMargin: '0px 0px -32px 0px', threshold: 1})
}

__Query__.prototype.observeDom = function (items) {
  var items = document.querySelectorAll(`.__Q__Item[${this.setKey()}]`)
  Array.prototype.forEach.call(items, item => {
    this.__Observer__.observe(item)
  })
}

__Query__.prototype.unObserveDom = function (items) {
  this.__Observer__.disconnect()
}

__Query__.prototype.handleKeydown = function (e) {
  var key = e.key || e.coed
  var keyCode = e.keyCode || e.which
  if (key === 'Backspace' || keyCode === 8) {
      return
  }

  if (this.__Open__) {  
      // Esc
      if (key === 'Escape') {
          e.stopPropagation()
          this.closeBox()
      }

      // 按上键
      if (key === 'ArrowUp') {
          if (this.__FoucsIndex__ <= 0) {
              this.__FoucsIndex__ = this.__ShowData__.length - 1
          } else {
              this.__FoucsIndex__--
          }
          this.navItem()
      }

      // 按下键
      if (key === 'ArrowDown') {
          if (this.__FoucsIndex__ >= this.__ShowData__.length - 1) {
              this.__FoucsIndex__ = 0
          } else {
              this.__FoucsIndex__++
          }
          this.navItem()
      }

      // enter
      if (key === 'Enter') {
          if (this.__FoucsIndex__ === -1) return this.closeBox()
          var item = this.__ShowData__[this.__FoucsIndex__]
          
          var lis = document.querySelectorAll(`.__Q__Item[${this.setKey()}]`)
          this.handleChange(item[this.__QueryKey__], lis[this.__FoucsIndex__])
      }

  } else {
      // enter
    if (key === 'Enter') {
        this.openBox()
    }
  }
}

__Query__.prototype.navItem = function () {
  var that = this
  var items = document.querySelectorAll(`.__Q__Item[${this.setKey()}]`)
  Array.prototype.forEach.call(items, function (item) {
    that.removeClassName(item, ' __Q_Item_Foucs')
  })
  this.addClassName(items[this.__FoucsIndex__], '__Q_Item_Foucs')

  var foucsKey = items[this.__FoucsIndex__].dataset[this.__QueryKey__]
  if (!this.__ObserverInfo__[foucsKey]) {
    this.__Box__.scrollTop = items[this.__FoucsIndex__].offsetTop
  }
}


__Query__.prototype.clear = function (e) {
  if (this.hasClassName(e.target, '__Q__clear')) {
    if (this.__Type__ === 'single') {
        this.__Val__ = ''
        this.__ValLabel__ = ''
        this.renderItemLi()
    } else {
        this.__Val__ = []
        this.__ValLabel__ = []
        this.renderMultipleItem()
    }
    
    this.__Input__.value = ''
    this.showAndHideClear()
  }
}


__Query__.prototype.showAndHideClear = function () {
    if (this.__Type__ === 'single' && this.__Val__) {
        this.addClassName(this.__tag_arrow, '__Q__clear')
    } else if (this.__Type__ === 'multiple' && this.__Val__.length) {
        this.addClassName(this.__tag_arrow, '__Q__clear')
    } else {
        this.removeClassName(this.__tag_arrow, '__Q__clear')
    }
  }

__Query__.prototype.resetQItemClassName = function (e) {
  var that = this
  var items = document.querySelectorAll(`.__Q__Item[${this.setKey()}]`)
  Array.prototype.forEach.call(items, function (item) {
    that.removeClassName(item, ' __Q__Changeing')
  })
}

__Query__.prototype.handleChange = function (val, el) {
  // 禁用
  var findVal = this.__Data__.find(i => String(i[this.__QueryKey__]) === String(val))
  if (findVal && findVal.__disabled__) {
      return
  }
  // 单选
  if (this.__Type__ === 'single') {
      this.__Val__ = val
      this.__Input__.value = val

      this.resetQItemClassName()
      if (el) this.addClassName(el, '__Q__Changeing')
      
      this.closeBox()
      this.handleValLabel(val)
      this.renderItemLi()
  } else {
      //多选
      var index = this.__Val__.findIndex(i => String(i) === String(val))
      if (index === -1) {
          this.__Val__.push(val)
          this.handleValLabel(val)
      } else {
          this.__Val__.splice(index, 1)
          this.handleValLabel(val, 'delete', index)
      }

      this.renderMultipleItem()
  }

  
  this.showAndHideClear()
}

__Query__.prototype.handleValLabel = function (val, type = 'add', index) {
  if (this.__Type__ === 'single') {
      this.__ValLabel__ = this.__ShowData__.find(item => String(item[this.__QueryKey__]) === String(val))
  } else {
      if (type === 'add') {
          this.__ValLabel__.push(this.__ShowData__.find(item => String(item[this.__QueryKey__]) === String(val)))
      } else {
          this.__ValLabel__.splice(index, 1)
      }
  }
}

__Query__.prototype.setMaxTagPlaceholder = function () {
  var num = this.__Val__.length - this.__MaxTagCount__
  if (typeof this.maxTagPlaceholder === 'function') {
      return this.maxTagPlaceholder(num)
  } else {
      return '+' + num + '...'
  }
}


__Query__.prototype.renderMultipleItem = function () {
  var chaildrens = ''
  var maxTags = ''
  this.__Val__.forEach((item, index) => {
      if (this.__MaxTagCount__ > 0 && this.__MaxTagCount__ <= index) {
          maxTags = `<span class="__Q__multiple__item __Q__Max_Tag" ${this.setKey()}>${this.setMaxTagPlaceholder()}</span>`
          return 
      }
      chaildrens += `<span class="__Q__multiple__item" data-${this.__QueryKey__}="${item}" ${this.setKey()}>
          ${item}
          <i class="__Q__tag __Q__close_tag" data-${this.__QueryKey__}="${item}" ${this.setKey()}></i>
      </span>`
  })

  chaildrens += maxTags
  this.__Multiple__Item__Box.innerHTML = chaildrens

  this.renderItemLi()
  this.setBoxPosition()
}

__Query__.prototype.renderItemLi = function () {
  var that = this
  var __Val = this.__Val__
  if (this.__Type__ === 'single') {
      __Val = [__Val]
  }
  var lis = document.querySelectorAll(`.__Q__Item[${this.setKey()}]`)
  Array.prototype.forEach.call(lis, function (item, liIndex) {
      var val = item.dataset[that.__QueryKey__]
      var index = __Val.findIndex(i => String(i) === String(val))
      if (index !== -1) {
          if (!that.hasClassName(item, '__Q__Changeing')) {
            that.addClassName(item, '__Q__Changeing')
          }
      } else {
          that.removeClassName(item, ' __Q__Changeing')
      }

      var __disabled__ = that.__ShowData__[liIndex].__disabled__
      __disabled__ ? that.addClassName(item, '__Q__Disabled') : ''

  })

}

__Query__.prototype.deleteMultipleItem = function (e) {
  e.stopPropagation()
  e = e || window.event
  var target = e.target
  if (this.hasClassName(target, '__Q__close_tag')) {
      var val = target.dataset[this.__QueryKey__]
      var index = this.__Val__.findIndex(i => String(i) === String(val))
      this.__Val__.splice(index, 1)
      this.handleValLabel(val, 'delete', index)
      this.renderMultipleItem()
  }
}

__Query__.prototype.closeBox = function () {
  this.__Open__ = false
  this.__Box__.style.display = 'none'
  this.removeClassName(this.__tag_arrow, ' __Q__tag_arrow')

  this.unObserveDom()
  if (!this.__QueryResult__) {
      // 上次搜索失败
      this.__Input__.value = ''
      this.query('', true)
  }
}

__Query__.prototype.openBox = function () {
  this.__Open__ = true
  this.__Box__.style.display = 'block'
  this.addClassName(this.__tag_arrow, '__Q__tag_arrow')

  this.observeDom()
}



__Query__.prototype.creatCssStyle = function () {
  if (document.querySelector(`style[data-id=select]`)) return

  var styleDom = document.createElement('style')
  styleDom.setAttribute('data-id', 'select')
  styleDom.innerHTML = `
      #${this.__Id__} {
          position: relative;
      }
      .__Q__select {
          width: 200px;
          min-height: 32px;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
          border: 1px solid #d7dde4;
          border-radius: 2px;
          padding: 4px 8px;
          font-size: 12px;
          color: #657180;
          display: flex;
          flex-direction: column;
          position: relative;
      }
      .__Q__select:focus {
          border-color: #5cadff;
          box-shadow: 0 0 0 2px rgba(51, 153, 255, .2);
          outline: 0;
      }
      .__Q__input {
          border: 0 none;
          outline: 0 none;
          width: 100%;
          padding: 0;
          margin: 0;
          flex: 1;
      }
      .__Q__Box {
          display: none;
          position: absolute;
          width: 200px;
          max-height: 300px;
          overflow: overlay;
          left: 0;
          top: 36px;
          box-shadow: 0 1px 6px rgba(0, 0, 0, .2);
          border-radius: 2px;
          border: 1px solid rgba(0 ,0 ,0, .2);
          padding: 5px 0;
          background: #fff;
      }
      .__Q__Item, .__Q__Item_nodata {
          padding: 7px 16px;
          padding-left: 40px;
          color: #515a6e;
          font-size: 14px;
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;
      }
      .__Q__Item_nodata {
        color: #c5c8ce;
      }
      .__Q__Item:hover, .__Q_Item_Foucs {
         background: #f3f3f3; 
      }
      .__Q__Changeing {
          color: #2d8cf0;
          position: relative;
      }
      .__Q__Changeing::after{
          content: '';
          position: absolute;
          left: 5px;
          top: 50%;
          margin-top: -12px;
          width: 24px;
          height: 24px;
          background-size: auto 100%;
          background-image: url(data:image/png;base64,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);
      }
      .__Q__multiple__item {
          height: 24px;
          line-height: 24px;
          display: inline-block;
          margin: 3px 4px 3px 0;
          padding: 0 8px;
          padding-right: 16px;
          border: 1px solid #e8eaec;
          border-radius: 3px;
          background: #f7f7f7;
          font-size: 12px;
          vertical-align: middle;
          position: relative;
      }
      .__Q__multiple__item__box {
          display: inline-block;
      }
      .__Q__delet_all {
          display: none;
      }
      .__Q__Disabled {
        color: #c5c8ce;
        cursor: not-allowed;
      }
      .__Q__Disabled:hover {
        background: transparent; 
      }

      .__Q__select_disabled {
        background-color: #f3f3f3;
        cursor: not-allowed;
        user-select: none;
      }

      .__Q__select_disabled .__Q__input {
        color: #ccc;  
        cursor: not-allowed;  
        user-select: none;
      }

      .__Q__tag {
        width: 12px;
        height: 12px;
        display: block;
        background-size: auto 100%;
        position: absolute;
        font-style: normal;
        cursor: pointer;
        transition: all 0.3s;
        right: 5px;
        top: 50%;
        margin-top: -6px;
        transform: rotate(0deg);
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACrUlEQVRYR+2UPWgUURSFz31rErBQBIWAhahYGC0ExUJMoYgWghOCCYJYKIrZmY2FQsjMJjtvk/3RqI3ZmUQwVqKwirhCCsFgIVoIgoXGQhQsFCGCYiEkcefK/Bhi3OxfEmKx08wU757zvTP3XsIyP7TM/qgB1BL4vxKIp+02U1fvLuVkzPWYSUCmh/aDnTGAFGmoD5cCQqbsIwDnBMTemBF+5np4ADI13ESUzzJjGwGTEEIxu8OPFhMifnHoEBwnx0ADEd4wh9ql0TE+k4CZGNxFRFkQbQTww2G09EW1J4sBEUta+wThAYBVAD7kidr7dfXlTAJ/THpT15pDCGUBNILxFQxF9mjPFwIhE9YeEHIgrAXhs2CnPWZ0evH/A+D9jrR1kBlZAlYD+CSIlFhAWylIX9re6TDnAKwH8J2Yj5rRyNhsnYJjGE9kFBbIAlTvRgYWioyGX1cCIJND20GOa74J4CkSotXsVkfnasy7B2QycwxEd7yYCG9FKKT0dnW8Kweif2B4i5PP55ixNTjfJg3tXqHaoosolho8KSBuBoWvph1uSfZEPhaDiCYyG+oEuQ23wzvHdEJG1Vvz1ZTchPFUJswg2xfjF1xHSrxL+1JI0BywGmmacyDa7XcYn5F65EYx4JIA/p6wzwN8NRB62kCk6Lr6bbZwOm2vmfQbrjlo706pa5lSv6wsAFfETNkGgZOB4GNMrVCkPPvTA5TXV6L+l2t+wO8Z7jL1yOVS5gXHsFiRTNn9APcENxxt2rxOcb/H30/kwDgcNKw0dS1ejnnFAN5tk9YVEC4EBveDd6sPRZekrnaXa14VQNATGYC1v414UBqRc5WYVw3gQaStETBOBYYj0tBOV2q+IAA/Ceu2O2vSUI9XY75ggGpNZ9eVPYaLYVZIowZQS6CWwG/bi94hnUoP1AAAAABJRU5ErkJggg==);
      }

      .__Q__tag_arrow {
        transform: rotate(180deg);
      }

      .__Q__clear:hover {
        width: 14px;
        height: 14px;
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACaUlEQVRYR82Xv2sUURDHv/M2YGPq/AFaaZkQ8URBJNooxMbWKtHsKShocc+Ym4txr1BQ0NtorGxtFLTRIILiiZKUsdI/IHVshOwb2b2s3G72x8sZ2Wy782Y+82bevO8jVPxRxfGxI4B5zz9uJDgFpSZIaEQgI2ECBFoXknUYs6zIeT+n3U+2iVkBNNv+NESmCRi1cSzAKoiWWg13qcy+EIA9f1Igs7aB08FCEAItsHZf5YHkArDnXwPkQVkGdv/pOmv3YZZtJgB7i2cB89rOua2VOsd65k3aehsALyyOQ5mvtm53ZGfUEZ6d+da/ZhtA0+usDFrzMpiwJ1q6PpYLEHY7iTwtc/Qv/4XoUv/pSOzA/8w+hk7vwl8AbndOQ/C2MLvAnFRDzoZAnovgcGIrCWsEumg2g2E46kOhH8IZbtTf9YbY1sde5x6AG0ULFdHYXMNdZe/JIaLgRQxBhDUR5wLry9/n2/6oEVkpKdN91vWbSYB25zMEtaKF/YFiiNA+Dp4Gy/VF6HKjfiwB0PL8HwI5UNZgaYjQPszcOnjv7vjZ1O7BdAk2AOwvA4gW9W15BJAqiYWPX6zrw3sLoPoSVN2EfPcRg1SzqH4BpHZHX/lSdAxve4+POqBuYR+IafGtq5zogUjtQD6WDaLAod9DRM+yBtGmyJQTyL6yQaRAJ2LVtHdGcZh55ZdRBFHlddwbKv4kIC8thskAJnQ+rQ9zJNlu6sGYM1sXFojS3dSF2XowcQyz9jPUh6KMP6hEi2S5UW5aByZ0hE0hK3uYpOG2VNMECLXMp5mgC8JyrHZskrN6mtk4GtSmcoA/gExqMAtj5nMAAAAASUVORK5CYII=);
      }

      .__Q__close_tag {
        right: 2px;
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACaUlEQVRYR82Xv2sUURDHv/M2YGPq/AFaaZkQ8URBJNooxMbWKtHsKShocc+Ym4txr1BQ0NtorGxtFLTRIILiiZKUsdI/IHVshOwb2b2s3G72x8sZ2Wy782Y+82bevO8jVPxRxfGxI4B5zz9uJDgFpSZIaEQgI2ECBFoXknUYs6zIeT+n3U+2iVkBNNv+NESmCRi1cSzAKoiWWg13qcy+EIA9f1Igs7aB08FCEAItsHZf5YHkArDnXwPkQVkGdv/pOmv3YZZtJgB7i2cB89rOua2VOsd65k3aehsALyyOQ5mvtm53ZGfUEZ6d+da/ZhtA0+usDFrzMpiwJ1q6PpYLEHY7iTwtc/Qv/4XoUv/pSOzA/8w+hk7vwl8AbndOQ/C2MLvAnFRDzoZAnovgcGIrCWsEumg2g2E46kOhH8IZbtTf9YbY1sde5x6AG0ULFdHYXMNdZe/JIaLgRQxBhDUR5wLry9/n2/6oEVkpKdN91vWbSYB25zMEtaKF/YFiiNA+Dp4Gy/VF6HKjfiwB0PL8HwI5UNZgaYjQPszcOnjv7vjZ1O7BdAk2AOwvA4gW9W15BJAqiYWPX6zrw3sLoPoSVN2EfPcRg1SzqH4BpHZHX/lSdAxve4+POqBuYR+IafGtq5zogUjtQD6WDaLAod9DRM+yBtGmyJQTyL6yQaRAJ2LVtHdGcZh55ZdRBFHlddwbKv4kIC8thskAJnQ+rQ9zJNlu6sGYM1sXFojS3dSF2XowcQyz9jPUh6KMP6hEi2S5UW5aByZ0hE0hK3uYpOG2VNMECLXMp5mgC8JyrHZskrN6mtk4GtSmcoA/gExqMAtj5nMAAAAASUVORK5CYII=);
      }
  `
  document.getElementsByTagName('head').item(0).appendChild(styleDom)
}

__Query__.prototype.query = function (q = '', isFirst = false) {
  this.__ShowData__ = this.__Data__.filter(i => String(i[this.__QueryKey__]).indexOf(q) !== -1)
  if (this.__ShowData__.length > this.__Slice__) {
      this.__ShowData__ = this.__ShowData__.slice(0, this.__Slice__)
  }
  this.renderItem()
  this.renderItemLi()
  if (!isFirst) {
      this.openBox()
  }
}

__Query__.prototype.renderItem = function () {
  var childrens = ''
  this.__ShowData__.forEach(i => {
      childrens += `<div class="__Q__Item" title="${i.text }" data-${this.__QueryKey__}="${i[this.__QueryKey__]}" ${this.setKey()}>
          ${i.text }
      </div>`
  })

  if (!this.__ShowData__.length) {
      childrens = '<div class="__Q__Item_nodata">未搜索到数据</div>'
      this.__QueryResult__ = false
  } else {
      this.__QueryResult__ = true
  }

  this.__Box__.innerHTML = childrens
}


__Query__.prototype.debounce = function (fn, wait) {
  var timeout = null
  return function () {
      if (timeout !== null) clearTimeout(timeout)
      timeout = setTimeout(fn.apply(this, arguments), wait)
  }
}

__Query__.prototype.setBoxPosition = function () {
  var select = document.querySelector(`.__Q__select[${this.setKey()}]`)
  var h = select.offsetHeight
  this.__Box__.style.top = h + 4 + 'px'
}

__Query__.prototype.$setVal = function (val) {
  if (this.__Type__ === 'single' && Boolean(val.push) !== true) {
      var fArr = this.__Data__.filter(i => String(i[this.__QueryKey__]) === String(val))
      if (fArr.length) this.handleChange(val)

  } else if (this.__Type__ === 'multiple' && Boolean(val.push) === true){
      var fArr = this.__Data__.filter(i => val.find(v => String(i[this.__QueryKey__]) === String(v)))
      fArr.forEach(i => { this.handleChange(i[this.__QueryKey__]) })

  } else {
      console.error('参数出错！')
      return
  }
}

__Query__.prototype.$getVal = function () {
  return this.__Val__
}

__Query__.prototype.$getVallabel = function () {
  return this.__ValLabel__
}

__Query__.prototype.addClassName = function (el, classname) {
    var elClassname = el.className
    if (elClassname.indexOf(classname) !== -1) {
        el.className = elClassname.replace(classname, classname)
    } else {
        el.className += ' ' + classname
    }
}

__Query__.prototype.removeClassName = function (el, classname) {
    var elClassname = el.className

    if (elClassname.indexOf(classname) !== -1) {
        el.className = elClassname.replace(classname, '')
    }
}

__Query__.prototype.hasClassName = function (el, classname) {
    var elClassname = el.className
    var keys = Object.keys(el.dataset)
    var reg = /q-\d+/


    var k = keys.filter(i => reg.test(i))[0]
    if (elClassname.indexOf(classname) !== -1 && `data-${k}` === this.setKey()) {
        return true
    }
}

__Query__.prototype.$setDisabled = function (flag = false) {
    this.__Disabled__ = flag
    this.__Input__.disabled = flag
    var select = document.querySelector(`.__Q__select[${this.setKey()}]`)
    flag ? this.addClassName(select, '__Q__select_disabled') : this.removeClassName(select, ' __Q__select_disabled')
}


