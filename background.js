chrome.extension.getBackgroundPage().console.log('foo');

chrome.runtime.onMessage.addListener(
    function(arg, sender, sendResponse) {
        var urls = arg.urls;

        chrome.extension.getBackgroundPage().console.log(urls);

        urls.forEach(function (url, index) {

            chrome.downloads.download({
                url: url.src,
                filename: 'photo' + url.photoId + '.jpg'
            }, function () {
                console.log('ok');
            })

        });

        sendResponse();

    }
);