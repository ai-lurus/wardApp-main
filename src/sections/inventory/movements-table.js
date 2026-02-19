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
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from 'src/components/severity-pill';
import { useTranslation } from 'react-i18next';

export const MovementsTable = (props) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => {},
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
    compact = false,
  } = props;

  const { t } = useTranslation();

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: compact ? 500 : 900 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('date')}</TableCell>
                <TableCell>{t('type')}</TableCell>
                <TableCell>{t('material')}</TableCell>
                <TableCell align="right">{t('quantity')}</TableCell>
                {!compact && (
                  <>
                    <TableCell align="right">{t('totalCost')}</TableCell>
                    <TableCell>{t('supplier')}/{t('destination')}</TableCell>
                    <TableCell>{t('user')}</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((movement) => (
                <TableRow hover key={movement.id}>
                  <TableCell>
                    {format(new Date(movement.movementDate), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <SeverityPill color={movement.type === 'entry' ? 'success' : 'warning'}>
                      {movement.type === 'entry' ? t('entry') : t('exit')}
                    </SeverityPill>
                  </TableCell>
                  <TableCell>{movement.materialName}</TableCell>
                  <TableCell align="right">{movement.quantity}</TableCell>
                  {!compact && (
                    <>
                      <TableCell align="right">
                        ${movement.totalCost.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {movement.type === 'entry' ? movement.supplier : movement.destination}
                      </TableCell>
                      <TableCell>{movement.createdBy}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
      {!compact && (
        <TablePagination
          component="div"
          count={count}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      )}
    </Card>
  );
};

MovementsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  compact: PropTypes.bool,
};
