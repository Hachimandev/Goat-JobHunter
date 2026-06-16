import { Button } from '@/components/ui/button';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from '@/components/ui/pagination';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface CustomPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onNextPage: () => void;
    onPreviousPage: () => void;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    visiblePageRange?: number;
}

export default function CustomPagination({
    currentPage,
    totalPages,
    onPageChange,
    onNextPage,
    onPreviousPage,
    hasNextPage,
    hasPreviousPage,
    visiblePageRange = 2,
}: Readonly<CustomPaginationProps>) {
    // Generate visible page numbers
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    const visiblePages = pageNumbers.slice(
        Math.max(0, currentPage - visiblePageRange),
        Math.min(totalPages, currentPage + visiblePageRange - 1),
    );

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                            className={`rounded-xl ${currentPage === 1 && 'pointer-events-none opacity-50'}`}
                            aria-label="First page"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                    </PaginationItem>

                    <PaginationItem>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onPreviousPage}
                            disabled={!hasPreviousPage}
                            className={`rounded-xl cursor-pointer ${
                                !hasPreviousPage && 'pointer-events-none opacity-50'
                            }`}
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </PaginationItem>

                    {currentPage > 2 && (
                        <>
                            <PaginationItem>
                                <PaginationLink onClick={() => onPageChange(1)} className="rounded-xl cursor-pointer">
                                    1
                                </PaginationLink>
                            </PaginationItem>
                            {currentPage > 3 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}
                        </>
                    )}

                    {visiblePages.map((page) => (
                        <PaginationItem key={page}>
                            <PaginationLink
                                onClick={() => onPageChange(page)}
                                isActive={page === currentPage}
                                className={`rounded-xl cursor-pointer ${
                                    page === currentPage
                                        ? 'bg-primary text-white hover:bg-primary hover:text-white'
                                        : ''
                                }`}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    ))}

                    {currentPage < totalPages - 1 && (
                        <>
                            {currentPage < totalPages - 2 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}
                            <PaginationItem>
                                <PaginationLink
                                    onClick={() => onPageChange(totalPages)}
                                    className="rounded-xl cursor-pointer"
                                >
                                    {totalPages}
                                </PaginationLink>
                            </PaginationItem>
                        </>
                    )}

                    <PaginationItem>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onNextPage}
                            disabled={!hasNextPage}
                            className={`rounded-xl cursor-pointer ${!hasNextPage && 'pointer-events-none opacity-50'}`}
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </PaginationItem>

                    <PaginationItem>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`rounded-xl ${currentPage === totalPages && 'pointer-events-none opacity-50'}`}
                            aria-label="Last page"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
