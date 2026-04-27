import { Dropdown, SearchBox } from "@fluentui/react"
import type { IDropdownOption } from "@fluentui/react"
import type { FilterState } from "../data/types.ts"
import styles from "./FilterBar.module.css"

interface FilterBarProps {
  filters: FilterState
  years: number[]
  categories: string[]
  onFilterChange: (filters: FilterState) => void
}

export default function FilterBar({
  filters,
  years,
  categories,
  onFilterChange,
}: FilterBarProps) {
  const yearOptions: IDropdownOption[] = [
    { key: 0, text: "All Years" },
    ...years.map((y) => ({ key: y, text: String(y) })),
  ]

  const quarterOptions: IDropdownOption[] = [
    { key: 0, text: "All Quarters" },
    { key: 1, text: "Q1" },
    { key: 2, text: "Q2" },
    { key: 3, text: "Q3" },
    { key: 4, text: "Q4" },
  ]

  const categoryOptions: IDropdownOption[] = [
    { key: "all", text: "All Categories" },
    ...categories.map((c) => ({ key: c, text: c })),
  ]

  return (
    <div className={styles.filterBar}>
      <div className={styles.filters}>
        <Dropdown
          selectedKey={filters.year}
          options={yearOptions}
          onChange={(_e, option) =>
            option && onFilterChange({ ...filters, year: option.key as number })
          }
          styles={{ dropdown: { width: 120 } }}
        />
        <Dropdown
          selectedKey={filters.quarter}
          options={quarterOptions}
          onChange={(_e, option) =>
            option &&
            onFilterChange({ ...filters, quarter: option.key as number })
          }
          styles={{ dropdown: { width: 120 } }}
        />
        <Dropdown
          selectedKey={filters.category}
          options={categoryOptions}
          onChange={(_e, option) =>
            option &&
            onFilterChange({ ...filters, category: option.key as string })
          }
          styles={{ dropdown: { width: 150 } }}
        />
      </div>
      <div className={styles.search}>
        <SearchBox
          placeholder="Search employee..."
          value={filters.searchTerm}
          onChange={(_e, newValue) =>
            onFilterChange({ ...filters, searchTerm: newValue || "" })
          }
        />
      </div>
    </div>
  )
}
