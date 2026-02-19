import PropTypes from 'prop-types';
import { format } from 'date-fns';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { t } from 'i18next';

export const MonitoringTable = (props) => {
  const {
    count = 0,
    items = [],
    onPageChange,
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
    columns = [],
    selectItem = () => {},
  } = props;
  
  return (
    <Card>
      <Scrollbar>
        <Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  ID
                </TableCell>
                {
                  columns.map((data) => 
                    <TableCell key={data?.title}>
                      {data?.title}
                    </TableCell>
                  )
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                return (
                  <TableRow
                    hover
                    key={item?.id}
                    onClick={() => selectItem(item?.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      {item?.id}
                    </TableCell>
                    {
                      columns.map((data) => 
                        <TableCell key={data?.attribute}>
                          {item?.[data?.attribute]}
                        </TableCell>
                      )
                    }
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};

MonitoringTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  selectItem: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  columns: PropTypes.array,
};
