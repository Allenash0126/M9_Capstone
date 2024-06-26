const getOffset = (limit = 4, page = 1) => (page - 1) * limit
const getPagination = (limit = 4, page = 1, total = 8) => {
  const totalPage = Math.ceil(total / limit)
  const pages = Array.from({ length: totalPage}, (_, index) => index + 1)
  const currentPage = page < 1 ? 1 : page > totalPage ? totalPage : page
  const prev = currentPage - 1 < 1 ? 1 : currentPage - 1
  const next = currentPage + 1 > totalPage ? totalPage : currentPage + 1
  return {
    totalPage,
    pages,
    currentPage,
    prev,
    next
  }
}

module.exports = {
  getOffset,
  getPagination
}