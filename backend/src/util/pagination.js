const paginate = ({ totalRecords = 0, recordsPerPage = 10, page = 1 }) => {
    const totalPages = Math.floor( totalRecords / recordsPerPage ) + 1;
    const offset = ( page - 1 ) * recordsPerPage;
    const limit = recordsPerPage;
    return { offset, limit, totalPages }
}

module.exports = {
    paginate
}