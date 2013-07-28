<script>
(function () {
'use strict';

var w = window;
var d = w.document;

w._gaq = w._gaq || [];

w._gaq.push(function() {
    var W3C = 'addEventListener';
    var IE = 'attachEvent';
    // crossdomain用
    var whitelist = [
        'google.co',
        'gmail.co'
    ];
    // eventtrack用
    var eventTrackRoot = 'navbar';

    function isMatch(whitelisted, linkHostname) {
        if (!linkHostname) {
            return;
        }
        return linkHostname.indexOf(whitelisted) >= 0;
    }

    function listen(obj, type, listener, opt_useCapture) {
        if (obj['data-gtmListening']) {
            return;
        }

        if (obj[W3C]) {
            obj[W3C](type, listener, !!opt_useCapture)
        } else if (obj[IE]) {
            obj[IE]('on' + type, listener);
        }

        obj['data-gtmListening'] = true;
    }

    // クロスドメイントラッキングの対象であるかを検証
    function isCrossDomain (link) {
        var hn = link.hostname;
        var i = 0, listLeng = whitelist.length;
        var thisDomain = d.domain;

        // 対象が空でなく且つ、ドメイン内遷移のリンクまたはハッシュではない場合に照合
        if (hn !== '' && hn !== thisDomain) {
            for (; i < listLeng; i++) {
                if (isMatch(whitelist[i], hn)) {
                    return true;
                }
            }
        }
        return false;
    }

    // イベントトラックの対象であるかを検証
    function isEventTrack (link) {
        var elem = link;
        var res = false;

        while (elem) {
            elem = elem.parentNode;

            if (elem.className.match(eventTrackRoot)) {
                res = true;
                break;
            }

        }

        return res;
    }


    function buildListener(checkGtmListening) {
        return function(event) {
            var link, txt;

            event = event || window['event'];

            link = event['target'] || event['srcElement'] || {};

            if (
                (checkGtmListening && link['data-gtmListening']) &&
                String(link.tagName).toLowerCase() !== 'a'
            ) {
                return;
            }

            // crossDomain対象である場合
            if (isCrossDomain(link)) {
                w.dataLayer.push({
                    event: 'cross_link',
                    targetUrl: link.href,
                    linkTarget: link.target
                });

                event.preventDefault && event.preventDefault();
                event.returnValue = false;

                return false;
            } else if (isEventTrack(link)) {
                txt = link.text || link.innerText || link.textContent;

                w.dataLayer.push({
                    event: 'event_link',
                    action: 'click',
                    label: 'transition to ' + txt,
                    value: txt
                });

                return true;
            }
        };
    }

    // legacy IE
    !d[W3C] && (function () {
        var allLinks = d.getElementsByTagName('a');
        var i = 0, linkLeng = allLinks.length;
        var anc;

        for (; i < linkLeng; i++) {
            anc = allLinks[i];

            if (isCrossDomain(anc)) {
                listen(anc, 'click', buildListener(false));
            }
        }
    }());

    // delegateでdocument内のclickイベントをlistenする
    listen(d, 'click', buildListener(true), true);
});

}());
</script>