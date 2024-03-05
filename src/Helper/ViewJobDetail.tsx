// DetailViewModal.tsx
import React from "react";
import { Modal, Table } from "antd";

interface DetailViewModalProps {
  isOpen: boolean;
  data: any | null; // Assume DataType is imported from the parent component
  columns: any;
  titleOfView: any;
  onClose?: () => void;
}

const DetailViewModal: React.FC<DetailViewModalProps> = ({
  isOpen,
  columns,
  data,
  titleOfView,
  onClose
}) => {
  return (
    <Modal
      open={isOpen}
      title={<span style={{ color: "navy" }}>{titleOfView}</span>}
      footer={null}
      width={2000} // Adjust the width as needed
      //style={{ width: "100%!important" }}
      onCancel={() => onClose && onClose()}
    >
      {data && (
        <Table columns={columns} dataSource={[data]} pagination={false} />
      )}
    </Modal>
  );
};

export default DetailViewModal;
