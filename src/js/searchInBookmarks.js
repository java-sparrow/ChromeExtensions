var bookmarksArray = [];

function getBookmarks (bookmarkNode) {
    var storeArray = [];
    
    $.each(bookmarkNode, function (i, bookmarkItem) {
        // 有url的才是具体书签。没有url的是文件夹或根节点
        if (bookmarkItem.url) {
            storeArray.push(bookmarkItem);
        }
        
        // 有子节点则继续递归
        if (bookmarkItem.children) {
            storeArray = storeArray.concat(getBookmarks(bookmarkItem.children));
        }
    });

    return storeArray;
}

chrome.bookmarks.getTree(function (bookmarkTreeNode) {
    bookmarksArray = getBookmarks(bookmarkTreeNode);

    // console.dir(bookmarksArray);
});


$(function () {
    var $_searchResultContainer = $("#searchResultContainer");
    var $_resultCount = $("#resultCount");
    var $_searchResultList = $("#searchResultList");
    var $_keyworkInput = $("#keyworkInput");

    $("#searchButton").click(function (e) {
        var keywork = $_keyworkInput.val();
        var result = bookmarksArray.filter(function (bookmarkItem, i) {
            return bookmarkItem.title.indexOf(keywork) >= 0;
        });

        // console.dir(result);

        $_searchResultList.html($.map(result, function (bookmarkItem) {
            return `
                <li>
                    <a href="#" class="result-text" title="${bookmarkItem.title}">${bookmarkItem.title}</a>
                    <div class="result-detail">
                        <span class="result-url">${bookmarkItem.url}</span>
                    </div>
                </li>
            `;
        }).join("") || `<li class="no-result-text">没有符合 <span class="search-key">${keywork}</span> 的结果</li>`);

        $_resultCount.html(result.length);
        $_searchResultContainer.show();
    });
});