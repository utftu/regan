"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var props_ts_1 = require("./props.ts");
var jsdom_1 = require("jsdom");
(0, vitest_1.it)('utils/props', function () {
    (0, vitest_1.describe)('addProp', function () {
        (0, vitest_1.it)('attr', function () {
            var window = new jsdom_1.JSDOM().window;
            var div = window.document.createElement('div');
            (0, props_ts_1.addFunc)(div, 'hello', 'world');
            (0, vitest_1.expect)(div.getAttribute('hello')).toBe('world');
        });
        // const dom = ha
    });
});
