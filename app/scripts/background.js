'use strict';
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    console.log(sender);
    if (request.action === 'xhttp') {
        var promise = $.ajax({
            contentType: request.contentType,
            data: request.data,
            dataType: request.dataType,
            type: request.type,
            url: request.url
        });
        promise.done(function(data) {
            callback(data);
        }).fail(function(jqXHR) {
            callback(jqXHR);
        });
        return true;
    }
});
