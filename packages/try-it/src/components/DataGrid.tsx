import React from 'react'
import { useTable } from 'react-table'
import styled from 'styled-components'

import { IRawResponse } from '@looker/sdk/lib/browser'

// TODO add pagination and sorting support
// Can start with https://github.com/tannerlinsley/react-table/blob/master/examples/pagination-controlled/src/App.js

type DataGridRow = Record<string, any>

interface IDataGridHeader {
  Header: string
  accessor: string
}

type DataGridHeaders = IDataGridHeader[]

// TODO lots of unit tests
const guessType = (datum: string): any => {
  if (datum.match(/^[-+]?\$*[0-9]*\.[0-9]*$/)) return parseFloat(datum)
  if (datum.match(/^[-+]?[0-9]+$/)) return parseInt(datum, 10)
  // if (isTrue(datum) || isFalse(datum)) return isTrue(datum)
  // TODO parse date/time
  return datum
}

const bodyToGridData = (rows: string[], delim: string) => {
  const result: DataGridRow[] = []
  if (rows.length < 1) return result
  const keys = rows[0].split(delim)
  rows.forEach((r, index) => {
    if (index) {
      const row: DataGridRow = {}
      const cells = r.split(delim)
      cells.forEach((c, pos) => {
        row[keys[pos]] = guessType(c)
      })
      result.push(row)
    }
  })
  return result
}

const bodyToGridHeaders = (rows: string[], delim: string) => {
  const result: DataGridHeaders = []
  if (rows.length < 1) return result
  const keys = rows[0].split(delim)
  keys.forEach((key) => result.push({ Header: key, accessor: key }))
  return result
}

const TableStyles = styled.div`
  padding: 1rem;
  table {
    border-spacing: 0;
    border: 1px solid black;
    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }
    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;
      :last-child {
        border-right: 0;
      }
    }
  }
  .pagination {
    padding: 0.5rem;
  }
`

export const DelimitedDataGrid = (response: IRawResponse, delim = ',') => {
  const lines = response.body.toString().split('\n')

  const columns = React.useMemo(() => bodyToGridHeaders(lines, delim), [])
  const data = React.useMemo(() => bodyToGridData(lines, delim), [])
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data })

  return (
    <TableStyles>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup: any, ti: number) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={ti}>
              {headerGroup.headers.map((column: any, hi: number) => (
                <th {...column.getHeaderProps()} key={`${ti}.${hi}`}>
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row: any, ri: number) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()} key={`row${ri}`}>
                {row.cells.map((cell: any, ci: number) => {
                  return (
                    <td {...cell.getCellProps()} key={`cell${ri}.${ci}`}>
                      {cell.render('Cell')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </TableStyles>
  )
}
