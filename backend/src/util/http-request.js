function adaptRequest(req) {
    return Object.freeze({
        path: req.path,
        method: req.method,
        url: req.originalUrl,
        pathParams: req.params,
        queryParams: req.query,
        body: req.body,
        user: req.user,
        files: req.files ? req.files : {},
        filename:req.filename
    });
}

function sendResponse(res, result) {
    const { status = 500, data } = result;
    return res.status(status).json(data);
}

module.exports = {
    adaptRequest,
    sendResponse
}