import { Pagination as AntPagination } from "antd";

export function Pagination({ page, totalPages, totalCount, hasNext, hasPrevious, onNext, onPrevious, disabled = false }: { page: number; totalPages: number; totalCount: number; hasNext: boolean; hasPrevious: boolean; onNext: () => void; onPrevious: () => void; disabled?: boolean }) {
  const safeTotalPages = Math.max(1, totalPages);
  return <AntPagination current={page} total={totalCount} pageSize={Math.max(1, Math.ceil(totalCount / safeTotalPages))} showSizeChanger={false} disabled={disabled} onChange={(nextPage) => { if (nextPage > page && hasNext) onNext(); if (nextPage < page && hasPrevious) onPrevious(); }} />;
}
