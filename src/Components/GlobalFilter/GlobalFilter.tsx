// GlobalFilter.tsx

import React, { useState } from "react";
import { Input, DatePicker, Button, Select, Col, Row } from "antd";
import { useEffect } from 'react';

type FieldType = 'date' | 'select' | 'text';

export interface FilterConfig {
  key: string;
  type: FieldType;
  placeholder?: string;
  allowClear?: boolean;
  options?: { label: string; value: string }[];
  width?: number
};

interface GlobalFilterProps {
  filterConfig: FilterConfig[];
  onFilterChange: (filters: Record<string, any>) => void;
}

const { RangePicker } = DatePicker;
const { Option } = Select;

const GlobalFilter: React.FC<GlobalFilterProps> = ({
  filterConfig,
  onFilterChange,
}) => {
  const [filters, setFilters] = useState<Record<string, any>>({});

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  useEffect(() => {
    if(Object.values(filters).length === 0) return;
    onFilterChange(filters)
  }, [filters])

  return (
    <Row gutter={[16, 16]} style={{ display: "flex", flexDirection: "row" }}>
      {filterConfig.map((config) => {
        let content = null;
        switch (config.type) {
          case "text":
            content = (
              <Input
                key={config.key}
                placeholder={config.placeholder}
                value={filters[config.key] || ""}
                onChange={(e) => handleFilterChange(config.key, e.target.value)}
              />
            );
            break;
          case "date":
            content = (
              <RangePicker
                style={{ width: config.width || "270px" }}
                size="large"
                allowClear={config.allowClear ?? true}
                key={config.key}
                onChange={(_, value) => handleFilterChange(config.key, value.filter(Boolean))}
              />
            );
            break;
          case "select":
            content = (
              <Select
                style={{ width: config.width || 200 }}
                key={config.key}
                placeholder={config.placeholder}
                allowClear={config.allowClear ?? true}
                size="large"
                value={filters[config.key] || undefined}
                onChange={(value) => handleFilterChange(config.key, value)}
              >
                {config.options?.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            );
            break;
          default:
            content = null;
            break;
        }
        return <Col >{content}</Col>;
      })}
    </Row>
  );
};

export default GlobalFilter;
