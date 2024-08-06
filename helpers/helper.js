module.exports = {
    json: function (context) {
        return JSON.stringify(context);
    },
    eq: function (v1, v2) {
        return v1 === v2;
    },
    inc: function (value) {
        return parseInt(value) + 1;
    },
    dec: function (value) {
        return parseInt(value) - 1;
    },
    range: function (n, start) {
        return Array.from({ length: n }, (v, k) => k + start);
    },
    gt: function (a, b) {
        return a > b;
    },
    lt: function (a, b) {
        return a < b;
    }
};
