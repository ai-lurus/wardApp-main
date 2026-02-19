import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { StockLevelBar, getStockStatus } from 'src/components/stock-level-bar';
import { useTranslation } from 'react-i18next';

const statusChipConfig = {
  inStock: { label: 'inStock', color: 'success' },
  lowStock: { label: 'lowStock', color: 'warning' },
  critical: { label: 'critical', color: 'error' },
  outOfStock: { label: 'outOfStock', color: 'default' },
};

export const MaterialsTable = (props) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => {},
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
    onEdit,
    onToggleActive,
  } = props;

  const { t } = useTranslation();

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 900 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('name')}</TableCell>
                <TableCell>{t('category')}</TableCell>
                <TableCell>{t('location')}</TableCell>
                <TableCell>{t('stockLevel')}</TableCell>
                <TableCell align="right">{t('referencePrice')}</TableCell>
                <TableCell>{t('status')}</TableCell>
                <TableCell>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((material) => {
                const status = getStockStatus(material.currentStock, material.minStock);
                const chipConfig = statusChipConfig[status];

                return (
                  <TableRow hover key={material.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{material.name}</Typography>
                      {material.sku && (
                        <Typography variant="caption" color="text.secondary">
                          {material.sku}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{material.categoryName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {material.location || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StockLevelBar
                        currentStock={material.currentStock}
                        minStock={material.minStock}
                      />
                    </TableCell>
                    <TableCell align="right">
                      ${material.referencePrice.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(chipConfig.label)}
                        color={chipConfig.color}
                        size="small"
                        variant={status === 'outOfStock' ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onEdit(material)}
                        >
                          {t('edit')}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color={material.active ? 'warning' : 'success'}
                          onClick={() => onToggleActive(material.id)}
                        >
                          {material.active ? t('deactivate') : t('activate')}
                        </Button>
                      </Stack>
                    </TableCell>
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

MaterialsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onEdit: PropTypes.func,
  onToggleActive: PropTypes.func,
};
