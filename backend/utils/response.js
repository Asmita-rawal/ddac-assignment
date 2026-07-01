exports.successResponse = (res, message, data = null, statusCode = 200) => {
    const response = {
        success: true,
        message,
        ...(data && { data })
    };
    return res.status(statusCode).json(response);
};

exports.errorResponse = (res, message, statusCode = 400, errors = null) => {
    const response = {
        success: false,
        message,
        ...(errors && { errors })
    };
    return res.status(statusCode).json(response);
};