'use strict';

var config = {
    API: 'http://api.gruppo.io:3000',
    CONTENT_SELECTOR: '#contentArea',
    OUR_ID: 'advance-search-plugin',
    ID_SELECTOR: '#advance-search-plugin',
    GROUP_ID_SELECTOR: 'input[name="group_id"]',
    IS_GROUP_SELECTOR: '.groupsCoverPhoto',
    SEARCH_RESULTS_ID: 'advance-search-records',
    SEARCH_RESULTS_SELECTOR: '#advance-search-records',
    SEARCH_FORM_ID: 'advance-search-form',
    SEARCH_FORM_SELECTOR: '#advance-search-form',
    SEARCH_RECORDS_LIST_ID: 'advance-search-records-list',
    SEARCH_RECORDS_LIST_SELECTOR: '#advance-search-records-list',
    LOADING_ID: 'advance-search-loading',
    LOADING_SELECTOR: '#advance-search-loading',
    INTERVAL: 2000
};

var interval;

var wrapperStart = '<div id="' + config.OUR_ID + '">';

var searchControls = '<div id="advance-search-controls"><label class="uiInputLabelLabel"><input type="checkbox" name="advance-search-in-posts" /> IN POSTS</label><label class="uiInputLabelLabel"><input type="checkbox" name="advance-search-by-user" /> By user</label><div class="right"><label class="uiInputLabelLabel"><input type="checkbox" name="advance-search-is-strict" /> Strict</label><button class="_42ft _4jy0 _517i _517h _51sy" type="submit">Search</button></div></div>';
var searchBox = '<form id="' + config.SEARCH_FORM_ID + '"><input type="text"  maxlength="100" aria-label="Search" name="advance-query" required="1" placeholder="Search this group"  value="">' + searchControls + '</form>';
var wrapperEnd = '</div>';
var poweredBy = '<span class="powered-by">Powered By <a href="http://gruppoi.io" >Gruppo</a></span>';
var loading = '<div id="' + config.LOADING_ID + '" class="loading"><span></span></div>';

var recordsList = '<ul id="' + config.SEARCH_RECORDS_LIST_ID + '"></ul>';
var searchResults = '<div id="' + config.SEARCH_RESULTS_ID + '"><h3 id="advance-search-header-title">Results - ' + poweredBy + ' <a href="#" id="advance-search-header-close">close</a></h3>' + loading + recordsList + '</div>';


function prepareContent(content) {
    return wrapperStart + content + searchResults + wrapperEnd;
}


function initAdvanceSearchQuery() {
    // var queryObj = '{"aggs":{},"query":{"isCheckInPosts":true,"isCheckInComments":false,"isCheckByUser":false,"operator":"or", "searchQuery": "sunny"}}';


    $('#advance-search-header-close').click(function(e) {
        e.preventDefault();
        $(config.SEARCH_RESULTS_SELECTOR).hide();
    });

    $(config.CONTENT_SELECTOR).on("submit", config.SEARCH_FORM_SELECTOR, function(e) {
        var fbGroup = $(config.GROUP_ID_SELECTOR).first().val();
        var queryObj = {};
        queryObj.aggs = {};
        queryObj.query = {
            searchQuery: $("input[name='advance-query']").first().val(),
            isCheckInPosts: $("input[name='advance-search-in-posts']").first().is(':checked'),
            isCheckInComments: false,
            isCheckByUser: $("input[name='advance-search-by-user']").first().is(':checked'),
            operator: $("input[name='advance-search-is-strict']").first().is(':checked') ? 'and' : 'or'
        };
        queryObj.size = 20;

        $(config.SEARCH_RESULTS_SELECTOR).show();
        $(config.LOADING_SELECTOR).show();
        $(config.SEARCH_RECORDS_LIST_SELECTOR).html('');


        chrome.runtime.sendMessage({
            action: 'xhttp',
            contentType: 'application/json',
            data: JSON.stringify(queryObj),
            dataType: 'json',
            type: 'POST',
            url: config.API + '/' + fbGroup + '/posts'
        }, function(data) {
            $(config.LOADING_SELECTOR).hide();
            var records = '';

            if (data.hits && data.hits.hits) {

                $.each(data.hits.hits, function(i, value) {
                    var record = value._source;
                    var message = record.message ? record.message.replace(/(?:\r\n|\r|\n)/g, '<br />') : '';

                    records += '<li><a href="https://www.facebook.com/' + record.from.id + '" class="avatar"><img src="https://graph.facebook.com/' + record.from.id + '/picture" alt="" /></a><div class="meta"><span class="name">' + record.from.name + '</span><a href="https://www.facebook.com/' + record.id + '" class="time">' + record.created_time + '</a></div><p>' + message + '</p></li>';
                });
                if(!records){
                    records = '<li class="error"><img src="'+chrome.extension.getURL('images/dafuq.jpg')+'"/>DAFUQ you are searching bro. I went on warp speed and travelled the whole universe and got nothing for your query. dafuqqqqqqqqqqq.</li>';
                }

            }else if(data.status === 500){
                records = '<li class="error"><img src="'+chrome.extension.getURL('images/thinking.jpg')+'"/>It seems this group is yet not added to <a href="http://gruppo.io/" target="_BLANK">gruppo</a>. I should ask <a href="https://www.facebook.com/groups/'+fbGroup+'/admins/">admins</a> to contact <a href="https://www.facebook.com/luthra.sunny">sunny</a> so that he can add it asap.</li>';
            }
            
            $(config.SEARCH_RECORDS_LIST_SELECTOR).html(records);
        });
        return false;
    });
}

interval = setInterval(function() {
    // Is it a group page
    var isGroup = $(config.IS_GROUP_SELECTOR).length;
    //INIT only if it is group page
    if (isGroup && !$(config.ID_SELECTOR).length) {
        var contentArea = $(config.CONTENT_SELECTOR);
        contentArea.prepend(prepareContent(searchBox));
        initAdvanceSearchQuery();
    }
}, config.INTERVAL);
