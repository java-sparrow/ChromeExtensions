// 简单封装
var executeCodeInPage = function (code, callback, isAllFrames) {
    /*
        Content script是在一个特殊环境中运行的，这个环境称为isolated world（隔离环境）。
        隔离环境使得content script可以修改它的javascript环境而不必担心会与这个页面上的其它content script冲突。
        例如，一个content script可以包含JQuery v2 而页面可以包含JQuery v1，它们之间不会产生冲突。
    */
    chrome.tabs.executeScript(null, {
        code: code,
        allFrames: isAllFrames || false
    }, callback);
};
var executeFileInPage = function (file, callback, isAllFrames) {
    chrome.tabs.executeScript(null, {
        file: file,
        allFrames: isAllFrames || false
    }, callback);
};

// TODO: 安全处理
var makeSafeString = function (string) {
    return string;
};


$(function () {
    // 包装需要动态执行的代码，以确保将数据回传
    var insertWrapCode = function (fnBody) {
        var wrapCode = `
            if (window != window.top) {
                var resultData = (function () {
                    ${fnBody}
                })();

                chrome.extension.sendMessage(null, resultData);
            }
        `;

        // 在所有的frame中 插入要执行的代码
        executeCodeInPage(wrapCode, null, true);
    };

    // 执行状态文本显示元素
    var $_executeStatusText = $("#executeStatusText");
    // 计数：接受到的信息
    var reciveMessage = 0;

    // 收到回传的数据后，将数据输入并执行用户代码
    chrome.extension.onMessage.addListener(function (data) {
        // 用户代码
        var processCode = makeSafeString($("#processCode").val());
        // 对象无法直接传递，得先序列化
        var passDataIiteral = JSON.stringify(data);

        // 在调用匿名立即执行函数时，序列化后的对象 是以字面量形式传递，所以在函数体里面可以直接当作对象使用，无需使用 JSON.parse
        var wrapCode = `
            (function (passData) {
                ${processCode}
            })(${passDataIiteral});
        `;

        // 仅在最顶层的frame里 插入要执行的代码
        executeCodeInPage(wrapCode, function () {
            // 更新执行状态文本
            $_executeStatusText.text(`已处理${++reciveMessage}个通信`);
        }, false);
    });

    // 按钮事件
    $("#executeButton").click(function () {
        // 是否载入jQuery（载入会有毫秒级的延迟）
        var isInsertJquery = $("#isInsertJquery").prop("checked");
        // 需要在frame里执行的代码
        var frameJsCode = makeSafeString($("#frameJsCode").val());

        if (isInsertJquery) {
            // 依赖jQuery时，代码需要在回调中插入，否则$变量无法使用
            executeFileInPage("lib/jquery-2.2.0.min.js", function () {
                insertWrapCode(frameJsCode)
            }, true);
        }
        else {
            insertWrapCode(frameJsCode);
        }
    });
});
