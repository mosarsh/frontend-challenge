//(function(){ Commented it as it needs some hack to test with anonymous functions
    'use strict';

    console.log('ready!');

    var ShowHideText = function(options) {
        this.options = options;
        this._status = 0;
    };

    ShowHideText.prototype.init = function() {
        this._el = options.element;
        this._btn = options.button;
        this._valueOn = options.showMoreText;
        this._valueOff = options.showLessText;

        this._btn.addEventListener("click", this.toggle.bind(this), false);
    };

    ShowHideText.prototype.toggle = function() {
        this.toggleStatus();
        this.setButtonText();
        this.runToggleFunction();
    };

    ShowHideText.prototype.runToggleFunction = function() {
        var self = this;
        if (typeof this.options.onToggle === "function")
            this.options.onToggle.call(this, this._status);
    };

    ShowHideText.prototype.toggleStatus = function() {
        this._status = this._status === 0 ? 1 : 0;
    };

    ShowHideText.prototype.setButtonText = function() {
        this._btn.innerHTML = (this._status ? this._valueOff : this._valueOn);
    };

    var options = {
        element : document.getElementById("hideMe"),
        button : document.getElementById("toggle"),
        showMoreText : "Show more",
        showLessText : "Show less",
        onToggle: function(status){
            status ? this._el.style.display = '' : this._el.style.display = 'none';
        }
    }

    var toggleText = new ShowHideText(options);
    toggleText.init();


//})();



