import { Button } from "@/components/ui/button";
import { useT } from "@/components/providers/I18nProvider";

interface PlaceListPaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function PlaceListPagination({
  page,
  pageCount,
  onPageChange,
}: PlaceListPaginationProps) {
  const t = useT();

  if (pageCount <= 1) return null;

  return (
    <nav
      className="mt-3 flex flex-wrap items-center justify-center gap-1"
      aria-label={t("home.paginationLabel")}
    >
      {Array.from({ length: pageCount }, (_, index) => index + 1).map(
        (pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            variant={pageNumber === page ? "default" : "outline"}
            size="sm"
            className="min-w-9 px-2"
            aria-label={t("home.pageNumber", { page: pageNumber })}
            aria-current={pageNumber === page ? "page" : undefined}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ),
      )}
    </nav>
  );
}
