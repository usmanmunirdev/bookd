import React from "react";
import RcPagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import localeInfo from "rc-pagination/lib/locale/en_US";

interface PaginationProps {
  pagination: any;
  page: number;
  setPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, page, setPage }) => {
  return (
    <div className="d-flex align-items-center justify-content-between mt-3">
      {pagination?.total ? (
        <div className="flex justify-end mb-3">
          <p className="mb-0 common-text-style text-theme-sm dark:text-gray-400">
            Showing {(pagination?.currentPage - 1) * 10 + 1}-
            {pagination?.currentPage * 10} of {pagination?.total} entries
          </p>
        </div>
      ) : null}
      <div className="flex justify-end">
        {pagination?.total > 10 && (
          <RcPagination
            className="m-3 custom-pagination"
            defaultCurrent={1}
            pageSize={10}
            current={pagination?.currentPage ?? page ?? 1} // current active page
            total={pagination?.total} // total pages
            onChange={(currentPage: any) => setPage(currentPage)}
            locale={localeInfo}
            showSizeChanger={true}
          />
        )}
      </div>
    </div>
  );
};

export default Pagination;
