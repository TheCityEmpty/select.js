function __Query__ ({
  id,
  data,
  slice = 50,
  placeHolder = '请选择',
  queryKey,
  type = 'single',
  maxTagCount = 0,
  maxTagPlaceholder = undefined
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
}

__Query__.prototype.renderDom = function () {
  var childrens = ''
  childrens = `
      <div class="__Q__select">
          <div class="__Q__multiple__item__box"></div>
          <input class="__Q__input" type="text" placeHolder="${this.__PlaceHolder__}"></input>
          <i class="__Q__close_tag __Q__delet_all" title="删除全部">x</i>
      </div>
      <div class="__Q__Box"></div>
  `
  this.__Dom__.innerHTML = childrens
}


__Query__.prototype.getDomObj = function () {
  // 挂载在 this 上的 dom

  // __Q__input
  this.__Input__ = document.querySelector('.__Q__input')

  // __Q__multiple__item__box
  this.__Multiple__Item__Box = document.querySelector('.__Q__multiple__item__box')

  // __Q__Box
  this.__Box__ = document.querySelector('.__Q__Box')

  // __Q__close_tag
  this.__Close_Tag_All = document.querySelector('.__Q__close_tag')
}

__Query__.prototype.clickInput = function () {
  this.__Open__ ? this.closeBox() : this.openBox()
}

__Query__.prototype.fnHandle = function () {
  var that = this
  this.__Input__.addEventListener('click', this.clickInput.bind(this, null))
  this.__Input__.addEventListener('input', this.debounce(function (e) {
      e = e || window.event
      var target = e.target|| e.srcElement
      that.query(target.value)
  }, this.__QueryDelay__))
  this.__Box__.addEventListener('click', function (e) {
      e = e || window.event
      var target = e.target|| e.srcElement
      if (target.className.indexOf('__Q__Item') !== -1) {
          that.handleChange(e.target.dataset[that.__QueryKey__])
      }
  })

  this.__Multiple__Item__Box.addEventListener('click', this.debounce(function (e) {
      that.deleteMultipleItem(e)
  }, 0))


  this.__Close_Tag_All.addEventListener('click', this.debounce(function (e) {
      that.deletAllItem(e)
  }, 0))

  document.body.addEventListener('click', function(e) {
      e = e || window.event
      var target = e.target|| e.srcElement
      if (target.className.indexOf('__Q__input') === -1 && target.className.indexOf('__Q__Item') === -1) {
          that.closeBox()
      }
  })


  this.__Dom__.addEventListener('keydown', this.debounce(function (e) {
      that.handleKeydown(e)
  }, 0))
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

          this.handleChange(item[this.__QueryKey__])
      }

  } else {

  }

  
}


__Query__.prototype.navItem = function () {
  var items = document.getElementsByClassName('__Q__Item')
  Array.prototype.forEach.call(items, function (item) {
      item.className = item.className.replace(' __Q_Item_Foucs', '')
  })
  items[this.__FoucsIndex__].className += ' __Q_Item_Foucs'
}


__Query__.prototype.deletAllItem = function (e) {
  this.__Val__ = []
  this.__ValLabel__ = []
  this.renderMultipleItem()
}

__Query__.prototype.resetQItemClassName = function (e) {
  var items = document.getElementsByClassName('__Q__Item')
  Array.prototype.forEach.call(items, function (item) {
      item.className = '__Q__Item'
  })
}

__Query__.prototype.handleChange = function (val) {
  // 单选
  if (this.__Type__ === 'single') {
      this.__Val__ = val
      this.resetQItemClassName()
      e.target.className += ' __Q__Changeing'
      this.__Input__.value = val
      this.closeBox()
      this.handleValLabel(val)
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
          maxTags = `<span class="__Q__multiple__item __Q__Max_Tag">${this.setMaxTagPlaceholder()}</span>`
          return 
      }
      chaildrens += `<span class="__Q__multiple__item" data-${this.__QueryKey__}="${item}">
          ${item}
          <i class="__Q__close_tag" title="删除选项" data-${this.__QueryKey__}="${item}">x</i>
      </span>`
  })

  chaildrens += maxTags
  this.__Multiple__Item__Box.innerHTML = chaildrens

  this.renderItemLi()
  this.setBoxPosition()
  if (this.__Val__.length) {
      this.__Close_Tag_All.style.display = 'block'
  } else {
      this.__Close_Tag_All.style.display = 'none'
  }
}

__Query__.prototype.renderItemLi = function () {
  var that = this
  var __Val = this.__Val__
  if (this.__Type__ === 'single') {
      __Val = [__Val]
  }
  var li = document.getElementsByClassName('__Q__Item')
  Array.prototype.forEach.call(li, function (item) {
      var val = item.dataset[that.__QueryKey__]
      var index = __Val.findIndex(i => String(i) === String(val))
      if (index !== -1) {
          if (item.className.indexOf('__Q__Changeing') === -1) {
              item.className += ' __Q__Changeing'
          }
      } else {
          item.className = '__Q__Item'
      }
  })  
}

__Query__.prototype.deleteMultipleItem = function (e) {
  e.stopPropagation()
  e = e || window.event
  var target = e.target|| e.srcElement
  if (target.className.indexOf('__Q__close_tag') !== -1) {
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

  
  if (!this.__QueryResult__) {
      // 上次搜索失败
      this.__Input__.value = ''
      this.query('', true)
  }
}

__Query__.prototype.openBox = function () {
  this.__Open__ = true
  this.__Box__.style.display = 'block'
}

__Query__.prototype.creatCssStyle = function () {
  var styleDom = document.createElement('style')
  styleDom.type = 'text/css'
  styleDom.innerHTML = `
      #__Query__ {
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
      .__Q__Item {
          padding: 7px 16px;
          color: #515a6e;
          font-size: 14px;
          cursor: pointer;
          white-space: nowrap;
      }
      .__Q__Item:hover, .__Q_Item_Foucs {
         background: #f3f3f3; 
      }
      .__Q__Changeing {
          // background: #f3f3f3; 
          color: #2d8cf0;
          position: relative;
      }
      .__Q__Changeing::after{
          content: '';
          position: absolute;
          right: 26px;
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
      .__Q__close_tag {
          position: absolute;
          font-style: normal;
          cursor: pointer;
          transition: all 0.3s;
          right: 5px;
          height: 16px;
          bottom: 5px;
      }
      .__Q__close_tag:hover {
          transform: scale(1.2);
          color: #2d8cf0;
      }
      .__Q__multiple__item__box {
          display: inline-block;
      }
      .__Q__delet_all {
          display: none;
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
      childrens += `<div class="__Q__Item${i.__disabled__ ? ' __Q__Disabled' : ''}" data-${this.__QueryKey__}="${i[this.__QueryKey__]}">
          ${i.text }
      </div>`
  })

  if (!this.__ShowData__.length) {
      childrens = '<div class="__Q__Item">未搜索到数据</div>'
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
  var select = document.querySelector('.__Q__select')
  var h = select.offsetHeight
  this.__Box__.style.top = h + 4 + 'px'
}

__Query__.prototype.$setVal = function (val) {
  if (this.__Type__ === 'single' && Boolean(val.push) !== true) {
      var fArr = this.__Data__.filter(i => String(i[this.__QueryKey__]) === val)
      if (fArr.length) this.handleChange(val)

  } else if (this.__Type__ === 'multiple' && Boolean(val.push) === true){
      var fArr = this.__Data__.filter(i => val.find(v => i[this.__QueryKey__] === v))
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
        el.className += classname
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

    if (elClassname.indexOf(classname) !== -1) {
        return true
    }
}


