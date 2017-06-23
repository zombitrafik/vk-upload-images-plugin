var links = [],
    photoIds = [];

function downloadAll(urls) {

    chrome.runtime.sendMessage({urls: urls}, function (r) {
        links = [];
        photoIds = [];
        updateDownloadButton();
        updateSelectedPhotos();
    });
}

window.onload = function() {

    $('#photos_container_photos .photos_row').each(function () {
        $(this).children('a').css('height', 'calc(100% - 10px)');
        var $div = $('<div class="select">+</div>').on('click', function () {

            var photoId = getPhotoId.apply(this);

            if($(this).parent().hasClass('selected-photo')) {
                photoIds.splice(photoIds.indexOf(photoId), 1);
            } else {
                photoIds.push(photoId);
            }
            $(this).parent().toggleClass('selected-photo');

            updateDownloadButton();
        });
        $(this).append($div);
    });

    var $downloadBtn = $('<div class="download-btn">Download</div>');
    $downloadBtn.on('click', function () {
        if(photoIds.length) {
            VKInit();
        }
    });
    $('#photos_container_photos').append($downloadBtn);

};

function updateDownloadButton() {
    var $downloadBtn = $('#photos_container_photos .download-btn');
    $downloadBtn.text(photoIds.length ? 'Download (' + photoIds.length + ')' : 'Download');
    if(photoIds.length) {
        $downloadBtn.addClass('active');
    } else {
        $downloadBtn.removeClass('active');
    }
}

function updateSelectedPhotos() {
    $('#photos_container_photos .photos_row').each(function () {
        $(this).removeClass('selected-photo');
    })
}

function getPhotoId() {
    var onclick = $(this).parent().children('a').attr('onclick');
    return onclick.split('showPhoto(\'')[1].split('\', {')[0].split('\', \'')[0];
}


function VKInit() {

    function vkApiCallback(e) {
        var data = e.detail.data;
        links = [];
        data.forEach(function (photo) {
            links.push({
                photoId: photo.owner_id + '_' + photo.pid,
                src: photo.sizes[photo.sizes.length - 1].src
            });
        });
        downloadAll(links);
    }

    document.removeEventListener('vkapi', vkApiCallback);
    document.addEventListener('vkapi', vkApiCallback);

    var s = document.createElement('script');

    s.src = chrome.extension.getURL('libs/vkopenapi.js');
    s.onload = function() {

        var d = document.createElement('script');
        d.src = chrome.extension.getURL('libs/jquery.min.js');
        d.onload = function () {


            var elt = document.createElement("script");

            elt.innerHTML = getApiScript(photoIds);

            document.head.appendChild(elt);


        };
        document.head.appendChild(d);


    };
    document.head.appendChild(s);

}

function getApiScript(photos) {

    return '' +
        'var YOUR_APP_ID = 6085467;' +
        'VK.init({' +
        'apiId: YOUR_APP_ID' +
        '});' +
        'VK.Auth.login(function(response) {' +
        'VK.Api.call(\'photos.getById\', {photos: \'' + photos.join(',') + '\', photo_sizes: 1}, function(r) {' +
        'var me = new CustomEvent("vkapi", {detail: {data: r.response}}); document.dispatchEvent(me);' +
        '});' +
        '' +
        '' +
        '}, 4);';

}