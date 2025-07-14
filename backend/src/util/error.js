function CustomError(err) {
    const { message = '', statusCode = 500 } = err;

    return Object.freeze({
        handle: function () {
            return { statusCode, data: { message } };
        }
    });
}

module.exports = CustomError