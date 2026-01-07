interface PaginationProps {
  pageNumber: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  loading?: boolean
}

export default function Pagination({
  pageNumber,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false,
}: PaginationProps) {
  const handlePageSizeChange = (newSize: number) => {
    onPageSizeChange(newSize)
    onPageChange(1) // Reset to first page when changing page size
  }

  return (
    <div className='flex items-center justify-between mt-6'>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-gray-700'>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          disabled={loading}
          className='px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={500}>500</option>
          <option value={1000}>1000</option>
        </select>
      </div>
      <div className='flex items-center gap-4'>
        <button
          onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
          disabled={pageNumber === 1 || loading}
          className='px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          ← Previous
        </button>
        <span className='text-gray-700'>
          Page {pageNumber} of {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, pageNumber + 1))}
          disabled={pageNumber === totalPages || loading}
          className='px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          Next →
        </button>
      </div>
    </div>
  )
}
