class Point2D{
    constructor(){
        this.x = 0;
        this.y = 0;
    }
}

class Point{
    constructor(){
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
}

class Transform2D{
    constructor(){
        this.position = new Point2D();
        this.rotate = new Point2D();
        this.scale = new Point2D();
    }
}

class Transform{
    constructor(){
        this.position = new Point();
        this.rotate = new Point();
        this.scale = new Point();
    }
}

class MousePosition{
    #element = null;
    /**
     * 
     * @param {HTMLElement} element 
     */
    constructor(element){
        this.#element = element;
    }

    /**
     * element in mouse position
     * @param {Event} e 
     */
    localMousePosition(e){
        let position = new Point2D();
        position = this.worldMousePosition(e);
        position.x = e.clientX - this.#element.offsetLeft;
        position.y = e.clientY - this.#element.offsetTop;
        return position;
    }
    /**
     * viewport in mouse position
     * @param {Event} e 
     */
    worldMousePosition(e){
        let position = new Point2D();
        position.x = e.clientX;
        position.y = e.clientY;
        return position;
    }
    toLocalMousePosition(worldPosition){
        let localPosition = worldPosition;
        localPosition.x -= this.#element.offsetLeft;
        localPosition.y -= this.#element.offsetTop;
        return localPosition;
    }
    toWorldMousePosition(localPosition){
        let worldPosition = localPosition;
        worldPosition.x += this.#element.offsetLeft;
        worldPosition.y += this.#element.offsetTop;
        return worldPosition;
    }
}

class MouseEventPositionDistance{
    #startPosition = new Point2D();
    #distance = new Point2D();
    #endEvent = ()=>{};
    /**
     * 
     * @param {HTMLElement} object 
     */
    constructor(object){
        this.object = object;
        this.mousePosition = new MousePosition(object);
    }
    setEndEvent(endEvent){
        this.#endEvent = endEvent;
    }
    setDistanceEvent(startEvent, endEvent){
        const self = this;
        this.isStarted = false;
        this.object.addEventListener(startEvent, (e)=>{
            self.isStarted = true;
            self.#startPosition = self.mousePosition.worldMousePosition(e);
        });
        this.object.addEventListener(endEvent, (e)=>{
            if(!self.isStarted) return;
            const endPosition = self.mousePosition.worldMousePosition(e);
            self.#distance.x = endPosition.x - self.#startPosition.x ;
            self.#distance.y = endPosition.y - self.#startPosition.y;
            self.isStarted = false;
            self.#endEvent(self.#distance);
        });
    }
    setResetEvent(...resetEvents){
        const self = this;
        const reset = ()=>{
            self.#distance.x = 0;
            self.#distance.y = 0;
            self.#startPosition.x = 0;
            self.#startPosition.y = 0;
            self.isStarted = false;
        };
        for (const resetEvent of resetEvents) {
            this.object.addEventListener(resetEvent, reset);
        }
    }
    /**
     * @returns {Point2D}
     */
    get distance(){
        return this.#distance;
    }
}

const Rand = (min, max)=> {
    return Math.random() * (max - min) + min;
};

const Base64 = {
    encode: (str)=> {
        if(str == null){
            return ;
        }
        return btoa(unescape(encodeURIComponent(str)));
    },
    decode: (str)=> {
        if(str == null){
            return ;
        }
        return decodeURIComponent(escape(atob(str)));
    }
};

class MouseEventEnum {
    /**
     * mousedown
     */
    static get DOWN(){
        return 'mousedown';
    }
    /**
     * mouseup
     */
    static get UP(){
        return 'mouseup';
    }
    /**
     * click
     */
    static get CLICK(){
        return 'click';
    }
    /**
     * mouseover
     */
    static get OVER(){
        return 'mouseover';
    }
    /**
     * mouseout
     */
    static get OUT(){
        return 'mouseout';
    }
}

class TouchEventEnum{
    /**
     * touchstart
     */
    static get DOWN(){
        return 'touchstart';
    }
    /**
     * touchend
     */
    static get UP(){
        return 'touchend';
    }
    /**
     * touchmove
     */
    static get MOVE(){
        return 'touchmove';
    }
    /**
     * click
     */
    static get CLICK(){
        return 'click';
    }
}

const isTouchable=()=>{
    return window.ontouchstart === null
};

class DisplayPoint extends Point2D{
    constructor(){
        super();
    }
    isHorizontalOverFlow(horizontalSize = 0){
        let htmlWidth = document.getElementsByTagName('html')[0].clientWidth;
        return htmlWidth < this.x + horizontalSize;
    }
    isVerticalOverFlow(verticalSize = 0){
        let htmlHeight = document.getElementsByTagName('html')[0].clientHeight;
        return htmlHeight < this.y + verticalSize;
    }
}

class FormDataMap extends Map{
    constructor(){
        super();
    }
    getFormData(){
        let formData = new FormData();
        for(let key of this.keys()){
            formData.append(key, this.get(key));
        }
        return formData;
    }
}

/**
 * @template T
 */
class List{
    /**
     * @param {Array} array
     */
    constructor(array = []){
        this.changeEvents = [];
        this.array = array;
    }
    
    static [Symbol.hasInstance](instance) {
        if(Array.isArray(instance.array)) return true;
        return false;
    }
    /**
     * @returns {array}
     */
    gets(){
        return this.array;
    }

    get length(){
        return this.array.length;
    }

    *[Symbol.iterator](){
        for(const value of this.gets()){
            yield value;
        }
    }

    /**
     * adding data
     * @param {T} value 
     * @param {Number} index start = 0
     */
    add(value, index = this.length){
        if(this.length === index){
            this.array[index] = value;
        } else {
            this.array.splice(index, 0, value);
        }
        for (const che of this.changeEvents) {
            if(typeof(che) == 'function') che(value);
        }
    }
    /**
     * remove data
     * @param {T} value 
     */
    remove(value){
        for(let data in this.array){
            if(value === this.array[data]){
                delete this.array[data];
                for (const che of instance.changeEvents) {
                    if(typeof(che) == 'function') che(this.array[data]);
                }
                return;
            }
        }
    }
    /**
     * @param {Number} index
     * @returns {T}
     */
    get(index){
        return this.array[index];
    }
    /**
     * remove all data
     */
    removeAll(){
        this.array = [];
    }

    /**
     * 
     * @param {T} value 
     * @returns {Number}
     */
    equalFindIndex(value){
        return this.array.findIndex(item => item === value);
    }
    
    count(){
        return Object.keys(this.array).length;
    }

    changeEvent(func){
        this.changeEvents[this.changeEvents.length] = func;
    }
}

/**
 * @extends {List <WebObject>}
 */
class WebObjectList extends List{
    /**
     * @param {WebObject} parent 
     */
    constructor(parent){
        super();
        this.parent = parent;
    }

    add(value, index = this.length){
        super.add(value, index);
        this.parent.object.appendChild(value.object);
    }
    remove(value){
        super.remove(value);
        value.destory();
    }
    removeAll(){
        super.removeAll();
        this.parent.removeAll();
    }
}

class SortType{
    /**
     * ascending
     */
    static get ASC(){
        return 'ASC';
    }
    /**
     * descending
     */
    static get DESC(){
        return 'DESC';
    }
}

class SortLink extends List{
    constructor(sortType = SortType.ASC){
         super();
         if(sortType == SortType.ASC){
            this.array.sort((v1, v2)=>{
                if (v1 > v2) return 1;
                if (v1 < v2) return -1;
                return 0;
            });
         } else {
            this.array.sort((v1, v2)=> {
                if (v1 > v2) return -1;
                if (v1 < v2) return 1;
                return 0;
            });
        }
    }
}

class CookieMap{
    #savePath = '';
    constructor(savePath = ''){
        this.#savePath = savePath;
    }

    *[Symbol.iterator](){
        let cookies = document.cookie.split('; ');
        for(const cookie of cookies){
            if(cookie === ''){
                continue;
            }
            const split = cookie.match('([^\S= ]*)=([A-z0-9=]*)');
            try {
                yield [split[1] , Base64.decode(split[2])];
            } catch (error) {
                
            }
        }
    }

    get(key){
        return Base64.decode(((document.cookie + '; ').match('['+key+'= ]=([A-z0-9=]*)')||[])[1]);
    }

    get path(){
        return this.#path;
    }

    /**
     * 
     * @override
     * @param {*} key 
     * @param {*} value 
     */
    set(key, value){
        document.cookie = key+'='+Base64.encode(value)+';'+this.path;
    }

    /**
     * 
     * @override
     * @param {*} key 
     */
    delete(key){
        document.cookie = key+'=;max-age=0';
    }
}

class ValueChangeEvent{
    #value = undefined;
    eventListenerList = new List();
    constructor(key, value){
        this.key = key;
        this.value = value;
    } 
    get value(){
        return this.#value;
    }

    set value(value){
        this.#value = value;
        for (const func of this.eventListenerList) {
            if(typeof(func) != 'function') return;
            func();
        }
    }
}

/**
 * @abstract
 */
class StorageMap{
    constructor(){
    }
    static get [Symbol.species](){
        return StorageMap;
    }
    /**
     * @protected
     * @returns {Storage}
     */
    getStorage(){
        return undefined;
    }
    /**
     * @readonly
     */
    get length(){
        return this.getStorage().length;
    }
    *[Symbol.iterator](){
        for (let index = 0; index < this.length; index++) {
            const key = this.getStorage().key(index);
            const value = this.get(key);
            yield [key , value];
        }
    }
    
    *keys(){
        for (let index = 0; index < this.length; index++) {
            yield(this.getStorage().key(index));
        }
    }

    *values(){
        for (let index = 0; index < this.length; index++) {
            yield this.get(this.getStorage().key(index));
        }
    }

    delete(key){
        this.getStorage().removeItem(key);
    }

    set(key, value){
        this.getStorage().setItem(key, value);
    }

    get(key){
        return this.getStorage().getItem(key);
    }

    clear(){
        for (const key of this.keys()) {
            this.getStorage().removeItem(key);
        }
    }

    has(key){
        return this.get(key) !== null;
    }
}

class LocalStorageMap extends StorageMap{
    static get [Symbol.species](){
        return LocalStorageMap;
    }
    getStorage(){
        return window.localStorage;
    }
}

class SessionStorageMap extends StorageMap{
    static get [Symbol.species](){
        return SessionStorageMap;
    }
    getStorage(){
        return window.sessionStorage;
    }
}

const UrlParam = {
    getGetter(){
        let params = new Map();
        let pair=location.search.substring(1).split('&');
        for(let paramCount = 0; pair[paramCount]; paramCount++){
            let sp = pair[i].split('=');
            params.set(sp[0], sp[1]);
        }
        return params;
    },
    /**
     * 
     * @param {Array} value 
     * @param {*} url 
     */
    setGetter(value, url=location.pathname){
        let _url = url;
        if(url.indexOf('?') === -1){
            _url+='?';
        }
        for(let key in value){
            _url += key+'='+encodeURI(value[key])+'&';
        }
        return _url.slice(0, -1);
    }
};

class ClipBoard {
    constructor(){
        this.clipDataElement = document.createElement('textarea');
        this.clipDataElement.classList.add = 'hideElement';
        this.body = document.getElementsByTagName('body')[0];
        this.body.appendChild(this.clipDataElement);
    }
    /**
     * 
     * @param {string} data 
     * @returns {bool} isComplete
     */
    set(data){
        this.clipDataElement.textContent = data;
        this.clipDataElement.select();
        let command = document.execCommand('copy');
        this.body.removeChild(this.clipDataElement);
        return command;
    }
}

class HttpRequestType{
    static get GET(){
        return 'GET';
    }
    static get POST(){
        return 'POST';
    }
}

class HttpResponseType{
    static get TEXT(){
        return 'text';
    }
    static get JSON(){
        return 'json';
    }
    static get BLOB(){
        return 'blob';
    }
    static get ARRAY_BUFFER(){
        return 'arraybuffer';
    }
    static get DOCUMENT(){
        return 'document';
    }
}

class RequestServerBase {
    /**
     * @constructor
     * @param {Map} requestHeader Post Param
     * @param {string} path url 
     * @param {Function} callBack
     * @param {string} type http request type
     * @param {string} responseType http response type
     */
    constructor(requestHeader, path, callBack, responseType=HttpResponseType.TEXT, type=HttpRequestType.POST){
        this.requestHeader = requestHeader;
        this.responseType = responseType;
        this.httpRequestor = this.httpRequest();
        this.callBack = callBack;
        this.src = path;
        this.type = type;
        this.sourceAsync = true;
        this.formDataMap = new FormDataMap();
    }

    set src(value){
        this.path = value;
    }

    get src(){
        return this.path;
    }

    set sourceAsync(async){
        this._async = async;
    }
    
    execute(){
        this.httpRequestor.open(this.type, this.path, this._async);
        this.httpRequestor.responseType=this.responseType;
        let instance = this;
        this.httpRequestor.addEventListener('load',()=>{
            if(instance.httpRequestor.readyState === instance.httpRequestor.DONE && instance.httpRequestor.status === 200){
                instance.callBack(xhr.response);
            }
        });
        if(this.requestHeader != null && this.requestHeader.size > 0){
            for(let key of this.requestHeader.keys()){
                this.httpRequestor.setRequestHeader(key, this.requestHeader.get(key));
            }
        }
        this.httpRequestor.send(this.formDataMap.getFormData());
    }

    /**
     * @private
     */
    httpRequest(){
        if(window.ActiveXObject) {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP");
            } catch(exception) {
                try {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                } catch(ignore){}
            }
        }
        return new XMLHttpRequest();
    }
}


class BindValue{
    #currentValue = "";
    #bindObjects = new List();

    set value(newValue){
        if(this.#currentValue !== newValue){
            for(let val of this.#bindObjects){
                val+='test';
                console.log(val);
            }
            this.#currentValue = newValue;
        }
    }
    get value(){
        return this.#currentValue;
    }

    set bindObject(obj){
        this.#bindObjects.add(obj);
    }

    get bindObjects(){
        return this.#bindObjects;
    }
}

/**
 * @abstract
 */
class WebObject{
    #obj = undefined;
    constructor(){
        this.#obj = document.createElement(this.tagName);
    }

    /**
     * object tag name
     */
    get tagName(){
        return undefined;
    }
    
    /**
     * remove this element
     */
    destory(viewTime = 0){
        setTimeout(()=>{
            this.object.parentNode.removeChild(this.object);
        }, viewTime);
    }

    /**
     * remove child all
     */
    removeAll(){
        while(this.object.lastChild){
            this.object.removeChild(this.object.lastChild);
        }
    }

    /**
     * @returns {HTMLElement}
     */
    get object(){
        return this.#obj;
    }
    
    set value(str){
        this.object.innerText = str;
    }
    
    get value(){
        return this.object.innerText;
    }
}

class DivObject extends WebObject{
    get tagName(){
        return 'div';
    }
}

class StyleObject extends WebObject{
    get tagName(){
        return 'style';
    }
}

class FlickObject extends DivObject{
    constructor(){
        super();
        this.mousePosition = new MouseEventPositionDistance(this.object);
    }
}

class ProgressComposite extends DivObject{
    changedValueFunction = new List();
    valueChangeFunctions = new List();
    #max = 1;
    #min = 0;
    #value = 0;
    constructor(){
        super();
        this.mousePosition = new MousePosition(this.object);
        this.changeingValueFunction = null;
        this.readOnly = false;
        this.isManualMoving = !1;
        this.view();
    }

    /**
     * @private
     */
    view(){
        this.object.classList.add('progress');
        this.progress = document.createElement('div');
        this.object.addEventListener('mousedown',()=>{
            this.isProgressManualMove = !0;
        });
        this.object.addEventListener('mouseout',(e)=>{
            if(e.relatedTarget !== this.object && e.relatedTarget !== this.progress){
                this.isProgressManualMove = !1;
                this.changedValueFunctionFire();
            }
        });
        this.object.addEventListener('mouseup',()=>{
            if(this.readOnly) return;
            this.isProgressManualMove = !1;
            this.changedValueFunctionFire();
        }, !0);
        this.object.addEventListener('mousemove',(e)=>{
            if(this.readOnly) return;
            if(this.isProgressManualMove){
                this.mouseMove(e);
            }
        });
        this.object.addEventListener('click',(e)=>{
            if(this.readOnly) return;
            this.mouseMove(e);
        });
        this.object.appendChild(this.progress);
    }
    mouseMove(event){
        this.value = (this.getOffset(event) / this.object.clientWidth * this.range) + this.min;
    }

    getOffset(event){
        return this.mousePosition.localMousePosition(event).x;
    }
    /**
     * 
     * @param {Number} value 
     */
    update(value = this.value){
        if(this.max === this.min){
            return
        }
        if(this.max < value || this.min > value){
            this.value = this.max;
        }
        if(this.progress != undefined){
            this.progress.style.transform = this.scaleStyle;
        }
        for(let changeListener of this.valueChangeFunctions){
            changeListener();
        }
    }

    get scaleStyle(){
        return `scaleX(${this.per})`;
    }

    changedValueFunctionFire(){
        this.changedValueFunction.gets().forEach((func)=>{
            func();
        });
    }
    
    /**
     * @param {number} value
     */
    get value(){
        return this.#value;
    }

    /**
     * @param {number} value
     */
    set value(value){
        this.#value = value;
        this.update(value);
    }


    /**
     * @param {number} max
     */
    get max(){
        return this.#max;
    }

    /**
     * @param {number} max
     */
    set max(max){
        if(this.min > max) return;
        this.#max = max;
        this.update();
    }

    get min(){
        return this.#min;
    }

    set min(min){
        if(min > this.max) return;
        this.#min = min;
        this.update()
    }

    get per(){
        if(this.max == 0){
            return 0;
        }
        return ((this.value-this.min) / this.range);
    }

    get range(){
        return this.max - this.min;
    }

}


class PObject extends WebObject{
    get tagName(){
        return 'p';
    }
}

class SpanObject extends WebObject{
    get tagName(){
        return 'span';
    }
}

class InputObject extends WebObject{
    
    constructor(){
        super();
        super.object.type = this.type;
    }

    get tagName(){
        return 'input';
    }
    
    get type(){
        return 'text';
    }

    set value(value){
        this.object.value = value;
    }
    
    get value(){
        return this.object.value;
    }
}

class TextArea extends WebObject{
    
    get tagName(){
        return 'textarea';
    }

    set value(str){
        this.object.value = str;
    }

    get value(){
        return this.object.value;
    }
}

class ComboBoxObject extends WebObject{

    /**
     * @type {List<OptionObject>}
     */
    optionList = new List();

    constructor(){
        super();
        this.object.size = this.SIZE;
    }

    get tagName(){
        return 'select';
    }

    /**
     * record size
     */
    get SIZE(){
        return 1;
    }

    /**
     * selection index
     * @param {Number} index
     */
    set value(index){
        this.optionList.get(index).object.selected = true;
    }

    get value(){
        this.optionList.gets().forEach((element)=>{
            if(element.object.selected){
                return element.value;
            }
        });
        return undefined;
    }

    /**
     * 
     * @param {Number} value 
     * @param {String} displayName 
     */
    addOption(value, displayName){
        const option = new OptionObject();
        option.value = value;
        option.displayName = displayName;
        this.optionList.add(option);
        this.object.appendChild(option.object);
    }

    removeOption(index){
        this.optionList.get(index).destory();
        this.optionList.remove(index);
    }
}

/**
 * inner class
 */
class OptionObject extends WebObject{
    
    get tagName(){
        return 'option';
    }

    set value(index){
        this.object.value = index;
    }

    get value(){
        return this.object.value;
    }

    set displayName(string){
        this.object.label = string;
        this.object.innerText = string;
    }
    get displayName(){
        return this.object.innerText;
    }
}

class PasswordInputObject extends InputObject{
    
    get type(){
        return 'password';
    }
}

class FileInputObject extends InputObject{
    
    get type(){
        return 'file';
    }
}

class CheckBoxObject extends InputObject{
    
    get type(){
        return 'checkbox';
    }
}

class ButtonObject extends InputObject{

    get type(){
        return 'button';
    }
}

class MessageWindow extends DivObject{
    #messageElement = undefined;
    constructor(){
        super();
        this.closeEvent = new List();
        this.#messageElement = new PObject();
        this.object.classList.add('message-box');
        this.createBlock();
    }

    set value(message){
        this.#messageElement.value = message;
    }

    get value(){
        return this.#messageElement.value;
    }

    /**
     * @private
     * @param {string} message 
     */
    createBlock(message = ''){
        fixed.appendChild(this.object);
        this.#messageElement.value = message;
        this.object.appendChild(this.#messageElement.object);
        return this;
    }
    /**
     * close window
     * @param {Number} viewTime 
     */
    close(viewTime = 0){
        let instance = this;
        setTimeout(()=>{
            instance.object.classList.add('height-hide');
            for (const func of instance.closeEvent) {
                if(typeof(func) == "function"){
                    func();
                }
            }
            instance.destory(300);
        },viewTime);
    }


    addCloseEvent(func){
        if(typeof(func) == 'function') return;
        this.closeEvent.add(func);
    }
}

class MessageButtonWindow extends MessageWindow {
    #buttonNameList = undefined;
    constructor(){
        super();
        this.#buttonNameList = new List();
        this.buttonFrame = new DivObject();
        this.createButtonBlock();
        this.object.appendChild(this.buttonFrame.object);
    }

    /**
     * @private
     */
    createButtonBlock(){
        this.changeButtonList();
        this.#buttonNameList.changeEvent(()=>{this.changeButtonList();});
        return this.buttonFrame;
    }

    /**
     * @private
     */
    changeButtonList(){
        this.buttonFrame.removeAll();
        for (const buttonName of this.#buttonNameList) {
            this.addButton(buttonName);
        }
    }

    /**
     * @param {MenuItem} menuitem
     */
    addButton(menuItem){
        if(menuItem === undefined) return;
        this.buttonFrame.object.appendChild(menuItem.webObject.object);
    }

    /**
     * 
     * @param {String} value 
     * @param {Function} onclick 
     */
    addItem(value, onclick){
        let menuItem = new MenuItem(new ButtonObject());
        menuItem.value = value;
        menuItem.onClickEvent = onclick;
        this.#buttonNameList.add(menuItem);
    }
}

class ULObject extends WebObject{
    constructor(){
        super();
        this.list = new WebObjectList(this);
    }

    get value(){
        return this.list;
    }

    set value(value){
    }

    get tagName(){
        return 'ul';
    }
}

class LIObject extends WebObject{
    constructor(){
        super();
    }

    get tagName(){
        return 'li';
    }
}

class LIButtonObject extends LIObject{
    constructor(){
        super();
        this.menuItem = new MenuItem(new ButtonObject());
        this.object.appendChild(this.menuItem.webObject.object);
    }
}

class DropDownObject extends ULObject{
    #dropdownNameObject = null;
    constructor(){
        super();
        this.object.classList.add('dropdown');
        this.dropdownObject = new LIObject();
    }

    set dropdownObject(value){
        if(this.dropdownObject != null){
            this.dropdownObject.destory();
        }
        this.#dropdownNameObject = value;
        if(this.list.get(0) == undefined){
            this.object.appendChild(this.dropdownObject.object);
        } else {
            this.object.insertBefore(this.dropdownObject.object,this.list.get(0).object);
        }
    }

    get dropdownObject(){
        return this.#dropdownNameObject;
    }

    set displayName(value){
        this.dropdownObject.value = value;
    }

    get displayName(){
        return this.dropdownObject.value;
    }

    /**
     * @param {String} value 
     * @param {Function} onclick 
     */
    addItem(value, onclick){
        let menuItem = new LIButtonObject();
        menuItem.menuItem.value = value;
        menuItem.menuItem.onClickEvent = onclick;
        this.list.add(menuItem);
    }
}

/**
 * @abstract
 */
class CanvasBase extends WebObject{
    #canvasObjectList = new List();
    #paramClass = null;
    constructor(){
        super();
        this.#paramClass = {
            mousePosition: new MousePosition(this.object)
            
        };
    }
    get canvas(){
        return this.context.canvas;
    }
    get tagName(){
        return 'canvas';
    }
    get width(){
        return this.canvas.width;
    }
    get height(){
        return this.canvas.height;
    }

    addCanvasObjectList(canvasObject){
        canvasObject.fcontext(this.context);
        let scale = new Point2D();
        scale.x = this.width;
        scale.y = this.height;
        canvasObject.canvasScale = scale;
        this.canvasObjectList.add(canvasObject);
    }
    removeCanvasObjectList(canvasObject){
        this.canvasObjectList.remove(canvasObject);
    }
    get canvasObjectList(){
        return this.#canvasObjectList;
    }
    run(){
        let self = this;
        this.renderFunction = (t)=>{
            self.render();
        };
        this.animationId = requestAnimationFrame(()=>{
            self.awake();
            self.reset();
            self.start();
            self.renderFunction();
        });
    }
    clear(){
        this.context.clearRect(
            0,
            0,
            this.width,
            this.height
        );
    }
    awake(){
        for (const canvasObject of this.canvasObjectList) {
            canvasObject.awake();
        }
    }
    reset(){
        for (const canvasObject of this.canvasObjectList) {
            canvasObject.reset();
        }
    }
    start(){
        for (const canvasObject of this.canvasObjectList) {
            canvasObject.start();
        }
    }
    fixedUpdate(){
        for (const canvasObject of this.canvasObjectList) {
            canvasObject.renderObjectBase();
        }
        for (const canvasObject of this.canvasObjectList) {
            canvasObject.fixedUpdate();
        }
    }
    checkCollisiton(){

    }
    update(){
        for (const canvasObject of this.canvasObjectList) {
            canvasObject.update();
        }
    }
    lateUpdate(){
        for (const canvasObject of this.canvasObjectList) {
            canvasObject.lateUpdate();
        }
    }

    render(){
        this.clear();
        this.fixedUpdate();
        this.checkCollisiton();
        this.update();
        this.lateUpdate();
        this.animationId = requestAnimationFrame(this.renderFunction);
    }

    quit(){
        for (const canvasObject of this.canvasObjectList) {
            canvasObject.quit();
        }
        cancelAnimationFrame(this.animationId); 
    }   
}

class Canvas2D extends CanvasBase{
    constructor(){
        super();
        this.context = this.object.getContext('2d');
    }
}

/**
 * 3dオブジェクトを表示するCanvasオブジェクト
 * (関数実行順はUnityを参考に作成)
 */
class Canvas extends CanvasBase{
    constructor(){
        super();
        this.canvas = this.object.getContext('webgl') || this.object.getContext('experimental-webgl');
    }
}

class CanvasObjectColor{
    r = 0xff;
    g = 0xff;
    b = 0xff;
    a = 100;
    get color(){
        return `rgb(${this.r},${this.g},${this.b},${this.a}%)`;
    }
}

class CanvasObjectBase{
    #color = new CanvasObjectColor();
    #_context = null;
    /**
     * @returns {CanvasObjectColor}
     */
    get color(){
        return this.#color;
    }

    /**
     * @param {RenderingContext} context
     * @returns {RenderingContext}
     */
    fcontext(context){
        this.#_context = context;
        return this.context;
    }
    /**
     * @returns {RenderingContext}
     */
    get context(){
        return this.#_context;
    }
    renderObjectBase(){
        this.context.beginPath();
        this.context.save();
        this.pathReset();
        this.renderObject();
        this.context.restore();
        this.context.closePath();
    }

    pathReset(){}

    renderObject(){}

    awake(){}
    reset(){}
    start(){}
    fixedUpdate(){}
    update(){}
    lateUpdate(){}
    quit(){}

}

class CanvasObject3DBase extends CanvasObjectBase{
    #path = undefined;
    constructor(){
        super();
        this.transform = new Transform();
    }

    get path(){
        return this.#path;
    }
}

class CanvasObject2DBase extends CanvasObjectBase{
    #path = new Path2D();
    #isFill = true;
    constructor(){
        super();
        this.transform = new Transform2D();
    }
    /**
     * @private
     */
    pathReset(){
        this.#path = new Path2D();
    }
    /**
     * @returns {Path2D}
     */
    get path(){
        return this.#path;
    }
    /**
     * @return {boolean}
     */
    get fill(){
        return this.#isFill;
    }

    set fill(value){
        this.#isFill = value;
    }

}

class BoxCanvasObject2D extends CanvasObject2DBase{
    update(){
        this.transform.rotate.x+=0.1;
    }

    renderObject(){
        this.context.translate(
            (this.transform.scale.x/2)-this.transform.position.x,
            (this.transform.scale.y/2)-this.transform.position.y);
        this.context.rotate(this.transform.rotate.x);
        this.context.translate(
            -((this.transform.scale.x/2)-this.transform.position.x),
            -((this.transform.scale.y/2)-this.transform.position.y));

    //    this.context.scale(this.transform.scale.x, this.transform.scale.y);
        let path = this.path;
        path.rect(
            this.transform.position.x, this.transform.position.y,
            this.transform.scale.x, this.transform.scale.y);

        this.context.fillStyle = this.color.color;
        this.context.fill(path);
        // this.context.fillRect(
        //     this.transform.position.x, this.transform.position.y,
        //     this.transform.scale.x, this.transform.scale.y);

    }
}

class MenuItem {
    /**
     * 
     * @param {WebObject} webObject 
     */
    constructor(webObject){
        this.webObject = webObject;
        this.value = '';
        this.onClickEvent= ()=>{};
    }

    get value(){
        return this.webObject.value;
    }

    set value(value){
        this.webObject.value = value;
    }

    set onClickEvent(func){
        return this.webObject.object.addEventListener(MouseEventEnum.CLICK, ()=>{func()});
    }
}

/**
 * 
 * @param {HTMLAnchorElement} tag 
 */
const LinkAction = (tag)=>{
    tag.addEventlistener(MouseEventEnum.CLICK,(e)=>{
        e.preventDefault();
        //TODO PageMove
    });
};

const ContextMenu = {
    isVisible: false,
    contextMenu: new ULObject(),
    position: new DisplayPoint(),
    /**
     * @param {Element} baseElement
     */
    baseElement: null,
    /**
     * 
     * @param {Event} e 
     */
    visible(e){
        e.preventDefault();
        if(ContextMenu.isVisible){
            ContextMenu.remove();
        }
        ContextMenu.baseElement = document.createElement('div');
        ContextMenu.baseElement.id='context-menu';
        ContextMenu.baseElement.appendChild(this.contextMenu.object);
        document.getElementsByTagName('html')[0].append(ContextMenu.baseElement);
        ContextMenu.setPosition(e);
        ContextMenu.isVisible=true;
    },
    /**
     * @private
     */
    removeEventSet(){
        document.getElementsByTagName('html')[0].addEventListener(MouseEventEnum.CLICK,()=>{
            ContextMenu.remove();
        });
        window.addEventListener('scroll', ()=>{
            ContextMenu.remove()
        });
        window.addEventListener('drag', ()=>{
            ContextMenu.remove();
        });
    },
    /**
     * @private
     * @param {Event} e 
     */
    setPosition(e){
        ContextMenu.position.x = e.pageX;
        ContextMenu.position.y = e.pageY;
        if(ContextMenu.position.isHorizontalOverFlow(ContextMenu.baseElement.clientWidth)){
            ContextMenu.position.x = ContextMenu.position.x - ContextMenu.baseElement.clientWidth;
        }
        ContextMenu.baseElement.style.left = ContextMenu.position.x+"px";
        ContextMenu.baseElement.style.top = ContextMenu.position.y+"px";
    },
    /**
     * @private
     * @param {MenuItem} contextMenuItem 
     */
    createMenuItemElement(contextMenuItem){
        link = document.createElement('button');
        link.innerText = contextMenuItem.displayName;
        link.addEventListener(MouseEventEnum.CLICK, (e)=>{
            e.preventDefault();
            contextMenuItem.onClickEvent();
        });
        link.classList.add('link');
        let item = document.createElement('li');
        item.appendChild(link);
        return item;
    },
    remove(){
        if(ContextMenu.isVisible){
            try{
                ContextMenu.baseElement.remove();
                ContextMenu.isVisible = false;
            }catch(e){}
        }
    }
};



class AudioClip{
    constructor(){
        this.no=0;
        this.src=null;
        this.soundHash=null;
        this.title=null;
        this.description=null;
    }
}

class AudioStateEnum{
    static get LOAD_START(){
        return 'loadstart';
    }
    static get PROGRESS(){
        return 'progress';
    }
    static get SUSPEND(){
        return 'suspend';
    }
    static get ABORT(){
        return 'abort';
    }
    static get ERROR(){
        return 'error';
    }
    static get EMPTIED(){
        return 'emptied';
    }
    static get STALLED(){
        return 'stalled';
    }
    static get LOADED_METADATA(){
        return 'loadedmetadata';
    }
    static get LOADED_DATA(){
        return 'loadeddata';
    }
    static get CAN_PLAY(){
        return 'canplay';
    }
    static get CAN_PLAY_THROUGH(){
        return 'canplaythrough';
    }
    static get PLAYING(){
        return 'playing';
    }
    static get WAITING(){
        return 'waiting';
    }
    static get ENDED(){
        return 'ended';
    }
    static get PAUSE(){
        return 'pause';
    }
}

class AudioPlayStateEnum{
    static get PLAY(){
        return 'play';
    }
    static get PAUSE(){
        return 'pause';
    }
    static get STOP(){
        return 'stop';
    }
}

class AudioLoopModeEnum{
    static get NON_LOOP(){
        return 'NON_LOOP';
    }
    static get AUDIO_LOOP(){
        return 'AUDIO_LOOP';
    }
    static get TRACK_LOOP(){
        return 'TRACK_LOOP';
    }
}

class AudioPlayer{
    constructor(){
        this.audio = new Audio();
        this.stateInit();
        this.audioContext = new AudioContext();
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.source.connect(this.audioContext.destination);
        this.audioClips = new List();
        this.currentAudioClip = null;
        this.loopMode = AudioLoopModeEnum.NON_LOOP;
        this.currentPlayState = AudioPlayStateEnum.STOP;
        this.setUpdate();
    }

    stateInit(){
        let instance = this;
        this.audioState = AudioStateEnum.PAUSE;
        this.audio.addEventListener(AudioStateEnum.ABORT,()=>{
            instance.audioState = AudioStateEnum.ABORT;
        });
        this.audio.addEventListener(AudioStateEnum.CAN_PLAY,()=>{
            instance.audioState = AudioStateEnum.CAN_PLAY;
        });
        this.audio.addEventListener(AudioStateEnum.CAN_PLAY_THROUGH,()=>{
            instance.audioState = AudioStateEnum.CAN_PLAY_THROUGH;
        });
        this.audio.addEventListener(AudioStateEnum.EMPTIED,()=>{
            instance.audioState = AudioStateEnum.EMPTIED;
        });
        this.audio.addEventListener(AudioStateEnum.ENDED,()=>{
            instance.audioState = AudioStateEnum.ENDED;
        });
        this.audio.addEventListener(AudioStateEnum.ERROR,()=>{
            instance.audioState = AudioStateEnum.ERROR;
        });
        this.audio.addEventListener(AudioStateEnum.LOADED_DATA,()=>{
            instance.audioState = AudioStateEnum.LOADED_DATA;
        });
        this.audio.addEventListener(AudioStateEnum.LOADED_METADATA,()=>{
            instance.audioState = AudioStateEnum.LOADED_METADATA;
        });
        this.audio.addEventListener(AudioStateEnum.LOAD_START,()=>{
            instance.audioState = AudioStateEnum.LOAD_START;
        });
        this.audio.addEventListener(AudioStateEnum.PAUSE,()=>{
            instance.audioState = AudioStateEnum.PAUSE;
        });
        this.audio.addEventListener(AudioStateEnum.PLAYING,()=>{
            instance.audioState = AudioStateEnum.PLAYING;
        });
        this.audio.addEventListener(AudioStateEnum.PROGRESS,()=>{
            instance.audioState = AudioStateEnum.PROGRESS;
        });
        this.audio.addEventListener(AudioStateEnum.STALLED,()=>{
            instance.audioState = AudioStateEnum.STALLED;
        });
        this.audio.addEventListener(AudioStateEnum.SUSPEND,()=>{
            instance.audioState = AudioStateEnum.SUSPEND;
        });
        this.audio.addEventListener(AudioStateEnum.WAITING,()=>{
            instance.audioState = AudioStateEnum.WAITING;
        });
        this.audio.addEventListener(AudioPlayStateEnum.PLAY,()=>{
            instance.audioPlayState = AudioPlayStateEnum.PLAY;
        });
        this.audio.addEventListener(AudioPlayStateEnum.PAUSE,()=>{
            instance.audioPlayState = AudioPlayStateEnum.PAUSE;
        });
    }

    /**
     * @private
     */
    setUpdate(){
        let instance = this;
        this.updateJob = setInterval(()=>{
            instance.audioUpdate();
        }, this.UPDATE_MILI_SEC);
    }

    /**
     * @private
     */
    audioUpdate(){
        switch(this.currentPlayState){
            case AudioPlayStateEnum.STOP:
            case AudioPlayStateEnum.PAUSE:
            {
                return;
            }
            case AudioPlayStateEnum.PLAY:
            {
                if(!this.isPlaying && !this.isLoading){
                    let audioClip = this.autoNextClip;
                    if(audioClip == undefined){
                        return;
                    }
                    this.setCurrentAudioClip(audioClip);
                    this.play();
                }
                return;
            }
        }
    }

    setCurrentAudioClip(setAudioClip){
        if(this.currentAudioClip === setAudioClip || setAudioClip == undefined){
            return;
        }
        this.currentAudioClip = setAudioClip;
        this.audioDeployment();
    }

    audioDeployment(){
        this.audio.src = this.currentAudioClip.src;
    }

    get UPDATE_MILI_SEC(){
        return 250;
    }

    get isLoading(){
        return (this.audioState === AudioStateEnum.LOAD_START || this.audioState === AudioStateEnum.PROGRESS);
    }

    get isPlaying(){
        if(this.audio.currentTime == 0&& isNaN(this.audio.duration)) return false;
        return (this.audio.currentTime !== this.audio.duration);
    }
    /**
     * @private
     */
    get autoNextClip(){
        if(this.currentAudioClip == null) {
            return this.audioClips.get(0);
        }
        switch(this.loopMode){
            case AudioLoopModeEnum.AUDIO_LOOP:
            {
                return this.currentAudioClip;
            }
            case AudioLoopModeEnum.NON_LOOP:
            case AudioLoopModeEnum.TRACK_LOOP:
            {
                return this.nextClip();
            }
        }
        return undefined;
    }
    nextClip(){
        let clipIndex = this.audioClips.equalFindIndex(this.currentAudioClip);
        if(this.currentAudioClip == null || clipIndex === -1){
            return this.audioClips.get(0);
        }
        let nextClip = this.audioClips.get(++clipIndex);
        if(nextClip == undefined){
            switch (this.loopMode) {
                case AudioLoopModeEnum.AUDIO_LOOP:
                case AudioLoopModeEnum.NON_LOOP:
                {
                    return undefined;
                }
                case AudioLoopModeEnum.TRACK_LOOP:
                {
                    return this.audioClips.get(0);
                }
            }
        }
        return nextClip;
    }
    play(audioClip = undefined){
        if(audioClip != undefined){
            this.currentAudioClip = audioClip;
        } else if(this.currentAudioClip == null){
            this.currentAudioClip = this.audioClips.get(0);
            if(this.currentAudioClip == undefined){
                return;
            }
        }
        this.audioDeployment();
        this.audio.play();
        this.currentPlayState = AudioPlayStateEnum.PLAY;
    }
    pause(){
        this.audio.pause();
        this.currentPlayState = AudioPlayStateEnum.PAUSE;
    }
    stop(){
        if(this.audio.src == null){
            return;
        }
        this.audio.pause();
        this.audio.currentTime = 0;
        this.currentPlayState = AudioPlayStateEnum.STOP;
    }
}
