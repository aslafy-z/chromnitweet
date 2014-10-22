/**
 * Copyright (c) 2013, Casey Dwyer
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var oauth = ChromeExOAuth.initBackgroundPage({
    'request_url': 'https://api.twitter.com/oauth/request_token',
    'authorize_url': 'https://api.twitter.com/oauth/authorize',
    'access_url': 'https://api.twitter.com/oauth/access_token',
    'consumer_key': 'pQtmomTX1QoatYhOOuHQNA',
    'consumer_secret': '91d5DacujLq6DZfe6vpIARTwrxKYAbm230N8KbnasM',
    'scope': 'https://api.twitter.com/1.1/statuses/update.json',
    'app_name': 'Chromnitweet'
});

function notify(iconUrl, title, message) {
    chrome.notifications.create('chromnitweet', {
        type: 'basic',
        iconUrl: iconUrl,
        title: title,
        message: message
    }, function(id) {
        window.setTimeout(function() {
            chrome.notifications.clear(id, function() {});
        }, 3000);
    });
}

oauth.authorize(function() {
    chrome.omnibox.onInputChanged.addListener(function(text) {
        chrome.omnibox.setDefaultSuggestion({
            description: String(140-text.length) + ' characters remaining.'
        });
    });
    chrome.omnibox.onInputEntered.addListener(function(text) {
        var url = 'https://api.twitter.com/1.1/statuses/update.json';
        var request = {'method': 'POST', 'parameters': {'status': text}}
        function callback(response, xhr) {
            var result = JSON.parse(response);
            if (result.errors !== undefined) {
                notify('icon128.png', 'Oops! There was an error.',
                    result.errors[0].message);
            } else {
                notify(result.user.profile_image_url_https, result.user.name,
                    result.text);
            }
        }
        oauth.sendSignedRequest(url, callback, request);
    });
});
