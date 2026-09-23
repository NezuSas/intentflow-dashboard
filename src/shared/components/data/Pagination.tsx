import { Pagination as AntPagination } from "antd";

export function Pagination({ page, pageSize, totalCount, onPageChange, disabled = false }: { page: number; pageSize: number; totalCount: number; onPageChange: (page: number) => void; disabled?: boolean }) {
  return <AntPagination current={page} total={totalCount} pageSize={pageSize} showSizeChanger={false} disabled={disabled} onChange={(nextPage) => onPageChange(nextPage)} />;
}
