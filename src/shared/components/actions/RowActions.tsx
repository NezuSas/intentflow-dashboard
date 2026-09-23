import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Popconfirm, Space } from "antd";
import { Button } from "./Button";

export function RowActions({ itemName, onEdit, onDelete }: { itemName: string; onEdit: () => void; onDelete: () => void | Promise<void> }) {
  return <Space size={8}>
    <Button type="button" variant="ghost" aria-label={`Edit ${itemName}`} icon={<EditOutlined />} onClick={onEdit} />
    <Popconfirm title={`Delete ${itemName}?`} description="This action cannot be undone." okText="Delete" okButtonProps={{ danger: true }} cancelText="Cancel" onConfirm={onDelete}>
      <Button type="button" variant="danger" aria-label={`Delete ${itemName}`} icon={<DeleteOutlined />} />
    </Popconfirm>
  </Space>;
}
