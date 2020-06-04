// ==UserScript==
// @name         Youtube playlist random fix
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       https://github.com/ExtremeDotneting
// @include      http*youtube.com*
// @require https://code.jquery.com/jquery-3.3.1.min.js
// @grant unsafeWindow
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_notification
// @grant GM_xmlhttpRequest
// @grant GM_deleteValue
// ==/UserScript==


//Main
var $ = null;
var video = null;

(async function () {
    if (!unsafeWindow.jQuery) {
        var jqText = await getJQueryText();
        injectJs_Text(jqText);
    }
    $ = unsafeWindow.jQuery;
    console.info('jQuery injected.');

    video = $(".html5-main-video")[0];

    restorePlaylistRandomState();

    video.onended = function (e) {
        nextRandomVideoHandler();
    };

    $('.ytp-next-button').first().click(function (ev) {
        nextRandomVideoHandler();
    });

    unsafeWindow.setInterval(function () {
        savePlaylistRandomState();
    }, 5000);

})();


//Project funcs
function nextRandomVideoHandler() {
    var nextVideoUrl = getNextVideoUrl();
    if (getRandomState() && !nextVideoUrl.includes('list=')) {
        var newNextVideoUrl = getRandomVideoUrl();
        savePlaylistRandomState();
        window.location.href = newNextVideoUrl;
    }
}

function savePlaylistRandomState() {
    var value = getRandomState();
    GM_setValue("pl_state_" + getParameterByName("list"), value);
    console.log("Saved playlist state: " + value);
}

function restorePlaylistRandomState() {
    var value = GM_getValue("pl_state_" + getParameterByName("list"));
    console.log("pl_state_" + getParameterByName("list"));
    if (value)
        setRandomState(value);
    console.log("Loaded playlist state: " + value);
}

function getRandomState() {
    var randomButton = getRandomizeButton();
    return randomButton.ariaPressed;
}

function setRandomState(state) {
    if (getRandomState() !== state) {
        getRandomizeButton().click();
    }
}

function getNextVideoUrl() {
    return $('.ytp-next-button')[0].href;
}

function setNextVideoUrl(url) {
    $('.ytp-next-button')[0].href = url;
}

function getRandomizeButton() {
    return $("#playlist").find('#top-level-buttons > ytd-toggle-button-renderer:nth-child(2)').find('button')[0];
}

function getRandomVideoUrl() {
    var list = $('a#wc-endpoint.yt-simple-endpoint.style-scope.ytd-playlist-panel-video-renderer');
    var index = getRandomInt(list.length);
    var el = list[index];
    return el.href;
}

//Common funcs
async function getJQueryText() {
    var cached = GM_getValue("jquery_cache_1");
    if (cached) {
        console.log("Cached jQuery used.");
        return cached;
    }
    var jqResponse = await getRequest('https://code.jquery.com/jquery-3.3.1.min.js');
    var jqStr = jqResponse.responseText;
    GM_setValue("jquery_cache_1", jqStr);
    console.log("jQuery downloaded.");
    return jqStr;
}

function injectJs_Func(func) {
    var script = document.createElement('script');
    script.appendChild(document.createTextNode('(' + func + ')();'));
    (document.body || document.head || document.documentElement).appendChild(script);
}

function injectJs_Text(text) {
    var script = document.createElement('script');
    script.text = text;
    (document.body || document.head || document.documentElement).appendChild(script);
}

function getRequest(src) {
    return new Promise(function (resolve, reject) {
        GM_xmlhttpRequest({
            method: "GET",
            url: src,
            onload: function (res) {
                resolve(res);
            },
            onerror: function (res) {
                reject(res);
            }
        });
    });

}

function getParameterByName(name, url) {
    if (!url) url = unsafeWindow.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}