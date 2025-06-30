// function CustomError({ message = 'Something went wrong!', status = 500 }) {
//     const error = {
//         message,
//         status
//     }
//     console.log(error);
//     function handle() {
//         return Object.freeze({
//             status: error.status,
//             data: {
//                 message: error.message
//             }
//         })
//     }
//     return Object.freeze({
//         ...error,
//         handle
//     })
// } 

// module.exports = CustomError;
module.exports = function CustomError(err) {
    console.log(err);
    const {message = '', status = 500} = err;
    return Object.freeze({
        handle: function () {
            return { status, data: { message }}
        }
    })
}