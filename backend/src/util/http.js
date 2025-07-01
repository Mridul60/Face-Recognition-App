function adaptRequest(req) {
    return Object.freeze({
        path: req.path,
        method: req.method,
        body: req.body,
        user:req.user,
        pathParams: req.params,
        queryParams: req.queryParams,
        files: req.files ? req.files : {},
        filename:req.filename
    })
}

function sendResponse(res, results) {
    const { statusCode = 200, ...rest } = results;
    return res.status(statusCode).json(rest);
}

module.exports = {
    adaptRequest,
    sendResponse
}