import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Popconfirm, Space } from "antd";
import { Button } from "./Button";

export function RowActions({ itemName, onEdit, onDelete }: { itemName: string; onEdit: () => void; onDelete: () => void | Promise<void> }) {
  return <Space size={8}>
    <Button type="button" variant="ghost" aria-label={`Editar ${itemName}`} icon={<EditOutlined />} onClick={onEdit} />
    <Popconfirm title={`¿Eliminar ${itemName}?`} description="Esta acción no se puede deshacer." okText="Eliminar" okButtonProps={{ danger: true }} cancelText="Cancelar" onConfirm={onDelete}>
      <Button type="button" variant="dangerText" aria-label={`Eliminar ${itemName}`} icon={<DeleteOutlined />} />
    </Popconfirm>
  </Space>;
}
